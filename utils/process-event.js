import { constants } from './index.js';

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