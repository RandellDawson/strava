import fetch from 'node-fetch';
import { authorize } from './index.js';
import { SUBSCRIPTION_ID, BASE_API_URL } from './constants.js';

const getActivityDetails = async (id, accessToken) => {
  const activityRoute = `${BASE_API_URL}/activities/${id}`;
  const requestOptions = {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  };
  const response = await fetch(activityRoute, requestOptions);
  const data = await response.json();
  return data;
};

const analyzeActivity = (activity) => {
  const { distance: meters, laps } = activity;
  const miles = Number((meters / 1609.344).toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]); 

  const lapPaces = laps.map(({ distance, moving_time: lapTime }) => {
    const paceDec = lapTime / 60;
    const mileage = distance / 1609.344;
    const pacePerMile = paceDec / mileage;
    const paceMins = Math.floor(pacePerMile);
    const paceSecs = ((pacePerMile - paceMins) * 60).toFixed(0);
    const paceStr = `${paceMins}:${paceSecs.padStart(2, '0')}`;
    return { pacePerMile, pace: paceStr , mileage }
  });
  
  const filterLapPaces = (expression) => {
    return lapPaces.filter(({ pacePerMile, mileage }) => {
      return eval(expression);
    });
  };

  const speedLaps = filterLapPaces('pacePerMile < 7 && mileage >= 0.06 && mileage <= 0.75');
  const tempoLaps = filterLapPaces('pacePerMile < 8 && mileage > 0.75');

  return { miles, speedLaps, tempoLaps };
};

const renameNewActivity = async (id) => {
  const accessToken = await authorize();
  const activity = await getActivityDetails(id, accessToken);
  const { miles, speedLaps, tempoLaps } = analyzeActivity(activity);  
  const mileageDesc = `${miles} miles`;

  let runEffort = 'Easy Run';
  if (miles >= 10) {
    runEffort = 'Long Run';
  }
  else if (speedLaps.length) {
    runEffort = 'Speed Workout'
  }
  else if (tempoLaps.length) {
    runEffort = 'Tempo Run'
  }
  const newName = `${runEffort} - ${mileageDesc}`;

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
  const response = await fetch(`${BASE_API_URL}/activities/${id}`, requestOptions);
  const data = await response.json();
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
    String(subscriptionID) === SUBSCRIPTION_ID &&
    activityID
  ) {
    await renameNewActivity(activityID);
  }
};

export { processEvent };