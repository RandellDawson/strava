
import { authorize, request, getActivities } from './index.js';
import { BASE_API_URL } from './constants.js';

const updateActivity = async (id, name, date) => {
  const accessToken = await authorize();
  const regex = /^(?<runType>\w+\s+\w+)\s*-\s*(?<mileageDesc>[\d\.]+\s+\w+)\s*(?<numStars>\s*\*+)$/i;
  const match = name.match(regex);
  if (match) {
    const { mileageDesc, numStars } = match.groups;
    const activityType = numStars.length === 2
      ? 'Warm Up'
      : 'Cool Down'
    const newName = `${activityType} Run - ${mileageDesc}`;
    
    const data = await request({
      method: 'put',
      url: `${BASE_API_URL}/activities/${id}`,
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: {
        access_token: accessToken,
        name: newName
      }
    });
    console.log(data);
  }
};

const getStarredActivities = async (num = 200) => {
  const accessToken = await authorize();
  const data = await getActivities(accessToken, num);

  const activities = data.map(({
    name,
    id,
    start_date
  }) => {
    const localDateTime = new Date(start_date).toLocaleString();
    return { id, name, localDateTime };
  });
  const warmupsAndCooldowns = activities.filter(({ name }) => name.endsWith('**'));
  return warmupsAndCooldowns;
};

const updateStarredActivitiesToWUCD = async (num) => {
  const wuAndCd = await getStarredActivities(num);
  for (const { localDateTime: date, id, name } of wuAndCd) {
    await updateActivity(id, name, date);
  }
};

export default updateStarredActivitiesToWUCD;