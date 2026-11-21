import { readFile } from 'node:fs/promises';

const dataUrl = new URL('../data/achievements.json', import.meta.url);
const validPlacement = value => value == null || (
  typeof value === 'object' && !Array.isArray(value) &&
  Number.isInteger(value.place) && value.place > 0 &&
  Number.isInteger(value.outOf) && value.outOf >= value.place
);

export function validateAchievements(data) {
  if (!data || data.version !== 1 || !Array.isArray(data.achievements)) throw new Error('Invalid achievements document');
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
  return data;
}

export async function loadPublicAchievements() {
  return validateAchievements(JSON.parse(await readFile(dataUrl, 'utf8')));
}
