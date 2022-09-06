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
  const { distance: meters, laps } = activity;
  const miles = Number((meters / 1609.344).toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]);

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
      lapTime: `${timeMins}:${timeSecs.padStart(2,'0')}`,
      pacePerMile,
      pace: paceStr,
      mileage
    };
  });

  const filterLapPaces = (expression) => {
    return lapPaces.filter(({ pacePerMile, mileage }) => {
      return eval(expression);
    });
  };

  const speedLaps = filterLapPaces('pacePerMile < 7 && mileage >= 0.06 && mileage <= 0.75');
  const tempoLaps = filterLapPaces('pacePerMile < 8 && mileage > 0.75');

  const speedLapSplitsText = createSplitAndPaceTimesText(speedLaps);
  const tempoLapSplitsText = createSplitAndPaceTimesText(tempoLaps);
  return {
    miles,
    speedLaps,
    tempoLaps,
    splitsText: { speed: speedLapSplitsText, tempo: tempoLapSplitsText } };
};

const renameNewActivity = async (id) => {
  const accessToken = await authorize();
  const activity = await getActivityDetails(id, accessToken);
  const { miles, speedLaps, tempoLaps, splitsText } = analyzeActivity(activity);
  const mileageDesc = `${miles} miles`;
  
  let runEffort = 'Easy Run';
  let lapSplitsText = '';
  if (miles >= 10) {
    runEffort = 'Long Run';
  }
  else if (speedLaps.length) {
    runEffort = 'Speed Workout';
    lapSplitsText = splitsText.speed;
  }
  else if (tempoLaps.length) {
    runEffort = 'Tempo Run';
    lapSplitsText = splitsText.tempo;
  }
  const newName = `${runEffort} - ${mileageDesc}`;
  let body = {
    access_token: accessToken,
    name: newName
  }
  if (runEffort === 'Speed Workout' || runEffort === 'Tempo Run') {
    body = { ...body, description: `splits:\n${lapSplitsText}` };
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

export default processEvent;