import { constants, request } from './index.js';

const authorize = async () => {
  const data = await request({
    method: 'post',
    url: 'https://www.strava.com/oauth/token',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: {
      client_id: constants.CLIENT_ID,
      client_secret: constants.CLIENT_SECRET,
      refresh_token: constants.REFRESH_TOKEN,
      grant_type: 'refresh_token'
    }
  });

  return data.access_token;
};

export default authorize;