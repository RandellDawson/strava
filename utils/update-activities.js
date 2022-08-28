import fetch from 'node-fetch';
import { authorize } from './index.js';
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
    const requestOptions = {
      method: 'put',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        access_token: accessToken,
        name: newName
      })
    };
    // const response = await fetch(`${BASE_API_URL}/activities/${id}`, requestOptions);
    // const data = await response.json();
    // console.log(data);
    console.log({date, id, name, newName});
  }
};

const getActivities = async (num = 100) => {
  const accessToken = await authorize();
  const activitiesRoute = `${BASE_API_URL}/athlete/activities?per_page=${num}&access_token=${accessToken}`;
  const response = await fetch(activitiesRoute);
  const data = await response.json();
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

const updateActivities = async(num = 100) => {
  const wuAndCd = await getActivities(num);
  for (const { localDateTime: date, id, name } of wuAndCd) {
    await updateActivity(id, name, date);
  }
};

export default updateActivities;