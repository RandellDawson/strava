import fetch from 'node-fetch';
import { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN } from './constants.js';

const authorize = async () => {
  const authLink = 'https://www.strava.com/oauth/token';
  const requestOptions = {
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token'
    })
  };
  const response = await fetch(authLink, requestOptions);
  const data = await response.json();
  return data.access_token;
};

export default authorize;