import {
  constants,
  authorize,
  getActivityDetails,
  analyzeActivity,
  createNewActivityNameAndDesc,
  request
} from './index.js';

const renameNewActivity = async (id) => {
  const accessToken = await authorize();
  const activity = await getActivityDetails(id, accessToken);

  const { avgDecPace, miles, speedLaps, tempoLaps } = analyzeActivity(activity);
  const { name, description } = createNewActivityNameAndDesc({
    avgDecPace,
    miles,
    speedLaps,
    tempoLaps
  });

  const body = { name, description };

  const data = await request({
    method: 'put',
    url: `${constants.BASE_API_URL}/activities/${id}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body
  });

  console.log('Activity renamed successfully:', data);
  return data;
};

export default renameNewActivity;