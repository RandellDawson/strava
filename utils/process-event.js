import fetch from 'node-fetch';
import { authorize } from './index.js';
import { SUBSCRIPTION_ID, BASE_API_URL } from './constants.js';

const getActivityDetails = async (id, accessToken) => {
  const activityRoute = `${BASE_API_URL}/activities/${id}`;
  const requestOptions = {
    method: 'get',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    }
  };

  const response = await fetch(activityRoute, requestOptions);
  const data = await response.json();
  return data;
};

const renameNewActivity = async (id) => {
  const accessToken = await authorize();
  const activity = await getActivityDetails(id, accessToken);
  const { distance: meters } = activity;
  const miles = meters / 1609.344;
  let runEffort = 'Easy Run';
  if (miles >= 10) {
    runEffort = 'Long Run';
  }
  const mileageDesc = `${miles.toFixed(2)} miles`;
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
    console.log('true');
    await renameNewActivity(activityID);
  }
};

export { processEvent };