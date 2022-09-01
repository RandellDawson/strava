import dotenv from 'dotenv';
dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const STRAVA_USERNAME = process.env.STRAVA_USERNAME;
const STRAVA_PASSWORD = process.env.STRAVA_PASSWORD;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const SUBSCRIPTION_ID = process.env.SUBSCRIPTION_ID;
const BASE_API_URL = 'https://www.strava.com/api/v3';

export default {
  CLIENT_ID,
  CLIENT_SECRET,
  REFRESH_TOKEN,
  STRAVA_USERNAME,
  STRAVA_PASSWORD,
  BASE_API_URL,
  VERIFY_TOKEN,
  SUBSCRIPTION_ID
};