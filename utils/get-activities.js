import { constants, request } from './index.js';

const getActivities = async (accessToken, num = 200) => {
  const activitiesRoute = `${constants.BASE_API_URL}/athlete/activities?per_page=${num}`;

  const data = await request({
    method: 'get',
    url: activitiesRoute,
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    }
  });

  return data;
};

export default getActivities;