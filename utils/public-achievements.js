import { readFile, stat } from 'node:fs/promises';

const dataUrl = new URL('../data/achievements.json', import.meta.url);
const validPlacement = value => value == null || (
  typeof value === 'object' && !Array.isArray(value) &&
  Number.isInteger(value.place) && value.place > 0 &&
  Number.isInteger(value.outOf) && value.outOf >= value.place
);

export function validateAchievements(data) {
  if (!data || !Array.isArray(data.achievements)) throw new Error('Invalid achievements document');
  const ids = new Set();
  for (const item of data.achievements) {
    if (!item || typeof item.id !== 'string' || !/^[a-z0-9-]+$/.test(item.id) || ids.has(item.id)) throw new Error('Invalid or duplicate achievement id');
    ids.add(item.id);
    if (typeof item.title !== 'string' || !item.title.trim() || !Array.isArray(item.categories) || !item.categories.length || !item.categories.every(c => typeof c === 'string' && /^[a-z0-9-]+$/.test(c))) throw new Error('Invalid achievement title or categories');
    if (item.date != null && (typeof item.date !== 'string' || !/^\\d{4}-\\d{2}-\\d{2}$/.test(item.date))) throw new Error('Invalid date');
    if (item.stravaActivityId != null && !/^\\d+$/.test(String(item.stravaActivityId))) throw new Error('Invalid Strava activity ID');
    if (item.athlinksUrl && (!/^https:\/\//.test(item.athlinksUrl) || new URL(item.athlinksUrl).hostname !== 'www.athlinks.com' && new URL(item.athlinksUrl).hostname !== 'athlinks.com')) throw new Error('Invalid Athlinks URL');
    if (item.placement != null) {
      if (typeof item.placement !== 'object' || Array.isArray(item.placement)) throw new Error('Invalid placement');
      for (const key of ['overall','gender','ageGroup']) {
        const value = item.placement[key];
        if (!validPlacement(value)) throw new Error('Invalid placement: ' + key);
        if (key === 'ageGroup' && value && (typeof value.name !== 'string' || !value.name.trim())) throw new Error('Age group name required');
      }
    }
  }
  if (data.races != null) {
    if (!Array.isArray(data.races)) throw new Error('Invalid races list');
    const raceIds = new Set();
    for (const race of data.races) {
      if (!race || typeof race.id !== 'string' || raceIds.has(race.id) ||
          !/^[a-z0-9-]+$/.test(race.id)) throw new Error('Invalid or duplicate race ID');
      raceIds.add(race.id);
      if (typeof race.race !== 'string' || !race.race.trim() ||
          !['marathon','half-marathon','10k','5k','other'].includes(race.distance) ||
          typeof race.date !== 'string' || !/^\\d{4}-\\d{2}-\\d{2}$/.test(race.date) ||
          typeof race.finishTime !== 'string' || !/^(?:\\d+:)?[0-5]?\\d:[0-5]\\d$/.test(race.finishTime)) throw new Error('Invalid race details');
      if (race.stravaActivityId != null && !/^\\d+$/.test(String(race.stravaActivityId))) throw new Error('Invalid race Strava ID');
      if (!race.placement || !['overall','gender','ageGroup'].every(k => validPlacement(race.placement[k]))) throw new Error('Invalid race placement');
    }
  }
  return data;
}

export function personalRecords(races) {
  const records = new Map();
  const seconds = time => time.split(':').reduce((total, part) => total * 60 + Number(part), 0);
  for (const race of races) {
    if (!race.distance || !race.finishTime) continue;
    const previous = records.get(race.distance);
    if (!previous || seconds(race.finishTime) < seconds(previous.finishTime)) records.set(race.distance, race);
  }
  return [...records.values()];
}

export async function loadPublicAchievements() {
  const data = validateAchievements(JSON.parse(await readFile(dataUrl, 'utf8')));
  const info = await stat(dataUrl);
  return { lastUpdated: info.mtime.toISOString(), ...data };
}
