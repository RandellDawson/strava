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
const SPEED_MAX_PACE = process.env.SPEED_MAX_PACE;
const SPEED_MIN_MILEAGE = process.env.SPEED_MIN_MILEAGE;
const SPEED_MAX_MILEAGE = process.env.SPEED_MAX_MILEAGE;
const TEMPO_MAX_PACE = process.env.TEMPO_MAX_PACE;
const TEMP_MIN_MILEAGE = process.env.TEMP_MIN_MILEAGE;

export default {
  CLIENT_ID,
  CLIENT_SECRET,
  REFRESH_TOKEN,
  STRAVA_USERNAME,
  STRAVA_PASSWORD,
  BASE_API_URL,
  VERIFY_TOKEN,
  SUBSCRIPTION_ID,
  SPEED_MAX_PACE,
  SPEED_MIN_MILEAGE,
  SPEED_MAX_MILEAGE,
  TEMPO_MAX_PACE,
  TEMP_MIN_MILEAGE
};