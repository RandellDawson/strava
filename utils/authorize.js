import dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch';

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const refreshToken = process.env.REFRESH_TOKEN;

const authorize = async () => {
  const authLink = 'https://www.strava.com/oauth/token';
  const requestOptions = {
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  };
  const response = await fetch(authLink, requestOptions);
  const data = await response.json();
  return data.access_token;
};

export default authorize;