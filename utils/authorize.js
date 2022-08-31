import { request } from './index.js';
import { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN } from './constants.js';

const authorize = async () => {
  const data = await request({
    method: 'post',
    url: 'https://www.strava.com/oauth/token',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token'
    }
  });

  return data.access_token;
};

export default authorize;