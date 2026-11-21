import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadPublicAchievements, validateAchievements } from '../utils/public-achievements.js';

test('initial achievements file is valid', async () => {
  assert.deepEqual((await loadPublicAchievements()).achievements, []);
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
