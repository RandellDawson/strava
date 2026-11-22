import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadPublicAchievements, validateAchievements, personalRecords } from '../utils/public-achievements.js';

test('initial achievements file is valid', async () => {
  const data = await loadPublicAchievements();
  assert.deepEqual(data.achievements, []);
  assert.match(data.lastUpdated, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(data.races.length, 22);
  assert.ok(data.races.every(r => ['competitor', 'official-pacer'].includes(r.role)));
  assert.ok(data.races.filter(r => r.role === 'competitor').every(r => r.pacing === null));
  const pacers = data.races.filter(r => r.role === 'official-pacer');
  assert.ok(pacers.length > 0);
  assert.ok(pacers.every(r => r.pacing && /^\d+:\d{2}:\d{2}$/.test(r.pacing.targetTime)));
  const prs = Object.fromEntries(personalRecords(data.races).map(r => [r.distance, r.finishTime]));
  assert.deepEqual(prs, { 'half-marathon': '1:30:07', marathon: '3:12:45', '10k': '41:41', '6mi': '41:06', '5k': '19:29' });
});

test('supports multiple categories and placement denominators', () => {
  const data = { achievements: [{
    id: 'sample-race', title: 'Sample race', categories: ['personal-record','age-group-placement'],
    stravaActivityId: '123456789', placement: {
      overall: { place: 42, outOf: 1250 },
      gender: { place: 35, outOf: 720 },
      ageGroup: { name: 'Men 55-59', place: 2, outOf: 48 }
    }
  }] };
  assert.equal(validateAchievements(data), data);
  assert.throws(() => validateAchievements({ ...data, achievements: [{ ...data.achievements[0], placement: { overall: { place: 4, outOf: 3 } } }] }), /Invalid placement/);
  assert.throws(() => validateAchievements({ ...data, achievements: [...data.achievements, data.achievements[0]] }), /duplicate/);
});

test('official pacers are excluded from competitive PRs', () => {
  const races = [{ distance: '5k', finishTime: '18:00', role: 'official-pacer' }, { distance: '5k', finishTime: '19:29', role: 'competitor' }];
  assert.equal(personalRecords(races)[0].finishTime, '19:29');
});

test('reads achievements from ACHIEVEMENTS_DATA_PATH when configured', async () => {
  const { mkdtemp, writeFile, rm } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const dir = await mkdtemp(join(tmpdir(), 'strava-achievements-'));
  const previous = process.env.ACHIEVEMENTS_DATA_PATH;
  const file = join(dir, 'achievements.json');
  try {
    const sample = { achievements: [], races: [{
      id: 'custom-location-race',
      race: 'Custom location test',
      distance: '5k',
      date: '2026-11-22',
      finishTime: '20:00',
      role: 'competitor',
      placement: { overall: null, gender: null, ageGroup: null }
    }] };
    await writeFile(file, JSON.stringify(sample));
    process.env.ACHIEVEMENTS_DATA_PATH = file;
    const loaded = await loadPublicAchievements();
    assert.deepEqual(loaded.achievements, []);
    assert.equal(loaded.races.length, 1);
    assert.equal(loaded.races[0].id, 'custom-location-race');
    assert.match(loaded.lastUpdated, /^\d{4}-\d{2}-\d{2}T/);

    await writeFile(file, '{ invalid json');
    await assert.rejects(loadPublicAchievements(), SyntaxError);
  } finally {
    if (previous === undefined) delete process.env.ACHIEVEMENTS_DATA_PATH;
    else process.env.ACHIEVEMENTS_DATA_PATH = previous;
    await rm(dir, { recursive: true, force: true });
  }
});

test('optional Strava embed tokens are validated and preserved', () => {
  const race = {
    id: 'embed-test', race: 'Embed Test', distance: '5k', date: '2026-11-22',
    finishTime: '20:00', role: 'competitor',
    placement: { overall: null, gender: null, ageGroup: null },
    stravaActivityId: '11225273619',
    stravaEmbedToken: 'BIUWF243x6wngbuOZbG075j-OfTi7pD2AxG_rONDLTw'
  };
  const document = { achievements: [], races: [race] };
  assert.equal(validateAchievements(document), document);
  assert.throws(() => validateAchievements({ achievements: [], races: [{ ...race, stravaEmbedToken: '<invalid>' }] }), /Invalid race Strava embed token/);
  assert.throws(() => validateAchievements({ achievements: [], races: [{ ...race, stravaActivityId: null }] }), /Invalid race Strava embed token/);
});
