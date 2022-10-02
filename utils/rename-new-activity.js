import { constants, authorize, getActivityDetails, analyzeActivity, createNewActivityNameAndDesc } from './index.js';

const renameNewActivity = async (id) => {
  const accessToken = await authorize();
  const activity = await getActivityDetails(id, accessToken);
  const { avgDecPace, miles, speedLaps, tempoLaps } = analyzeActivity(activity);
    
  const { name, description } = createNewActivityNameAndDesc({
    avgDecPace, miles, speedLaps, tempoLaps
  });
  
  let body = {
    access_token: accessToken,
    name,
    description
  }

  const data = await request({
    method: 'put',
    url: `${constants.BASE_API_URL}/activities/${id}`,
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body
  });
  console.log(data);
};

export default renameNewActivity;