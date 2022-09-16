import { constants, authorize, request } from './index.js';

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

const createSplitAndPaceTimesText = (laps) => laps
  .map(({ lapTime, pace }, index) => `#${index + 1} - ${lapTime} (pace: ${pace})`)
  .join('\n');

const analyzeActivity = (activity) => {
  const { moving_time: totalTime, distance: meters, laps } = activity;
  const miles = Number((meters / 1609.344).toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]);
  const avgDecPace = (totalTime / 60) / miles;
  const lapPaces = laps.map(({ distance, moving_time: lapTime }) => {
    const paceDec = lapTime / 60;
    const timeMins = Math.floor(paceDec);
    const timeSecs = ((paceDec - timeMins) * 60).toFixed(0);
    const mileage = distance / 1609.344;
    const pacePerMile = paceDec / mileage;
    const paceMins = Math.floor(pacePerMile);
    const paceSecs = ((pacePerMile - paceMins) * 60).toFixed(0);
    const paceStr = `${paceMins}:${paceSecs.padStart(2, '0')}`;
    return {
      lapTime: `${timeMins}:${timeSecs.padStart(2, '0')}`,
      pacePerMile,
      pace: paceStr,
      mileage
    };
  });
  
  const speedLaps = lapPaces.filter(({ pacePerMile, mileage }) => {
    return pacePerMile < constants.SPEED_MAX_PACE &&
      mileage >= constants.SPEED_MIN_MILEAGE &&
      mileage <= constants.SPEED_MAX_MILEAGE;
  });

  const tempoLaps = lapPaces.filter(({ pacePerMile, mileage }) => {
    return pacePerMile < constants.TEMPO_MAX_PACE &&
      mileage >= constants.TEMPO_MIN_MILEAGE;
  });

  return {
    miles,
    avgDecPace,
    speedLaps,
    tempoLaps
  };
};

const createNewActivityNameAndDesc = ({
  avgDecPace, miles, speedLaps, tempoLaps
}) => {

  let runEffort = 'Easy Run';
  let lapSplitsText = '';
  if (miles >= 10) {
    runEffort = 'Long Run';
  } else if (speedLaps.length) {
    runEffort = 'Speed Workout';
    lapSplitsText = createSplitAndPaceTimesText(speedLaps);;
  } else if (tempoLaps.length) {
    runEffort = 'Tempo Run';
    lapSplitsText = createSplitAndPaceTimesText(tempoLaps);
  } else if (miles <= 7 && avgDecPace > constants.RECOVERY_MIN_PACE) {
    runEffort = 'Recovery Run';
  }

  const mileageDesc = `${miles} miles`;
  const name = `${runEffort} - ${mileageDesc}`;
  const description = runEffort === 'Speed Workout' || runEffort === 'Tempo Run'
    ? `splits:\n${lapSplitsText}`
    : '';
  return { name, description };
};

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

const processEvent = async (req, res) => {
  console.log("webhook event received!", req.query, req.body);
  const {
    aspect_type: aspectType,
    object_type: eventType,
    subscription_id: subscriptionID,
    object_id: activityID,
  } = req?.body;

  const response = eventType === 'activity' || eventType === 'athlete'
    ? 'EVENT_RECEIVED'
    : '';
  res
    .status(200)
    .send(response);

  if (
    aspectType === 'create' &&
    String(subscriptionID) === constants.SUBSCRIPTION_ID &&
    activityID
  ) {
    await renameNewActivity(activityID);
  }
};

export { 
  createNewActivityNameAndDesc,
  createSplitAndPaceTimesText,
  analyzeActivity,
  processEvent
};