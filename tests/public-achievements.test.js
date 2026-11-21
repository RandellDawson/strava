import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadPublicAchievements, validateAchievements, personalRecords } from '../utils/public-achievements.js';

test('initial achievements file is valid', async () => {
  const data = await loadPublicAchievements();
  assert.deepEqual(data.achievements, []);
  assert.equal(data.races.length, 22);
  const prs = Object.fromEntries(personalRecords(data.races).map(r => [r.distance, r.finishTime]));
  assert.deepEqual(prs, { 'half-marathon': '1:30:07', marathon: '3:12:45', '10k': '41:06', '5k': '19:29' });
});

test('supports multiple categories and placement denominators', () => {
  const data = { version: 1, achievements: [{
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
