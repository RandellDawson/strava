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
  assert.deepEqual(prs, { 'half-marathon': '1:30:07', marathon: '3:12:45', '10k': '41:06', '5k': '19:29' });
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
