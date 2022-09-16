import { constants } from './index.js';

const getActivityDetails = async (id, accessToken) => {
  const data = await request({
    method: 'get',
    url: `${constants.BASE_API_URL}/activities/${id}`,
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  });

  return data;
};

export default getActivityDetails;