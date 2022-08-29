import dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch';
import puppeteer from 'puppeteer';

import { authorize } from './index.js';
import { BASE_API_URL } from './constants.js';

const username = process.env.STRAVA_USERNAME;
const password = process.env.STRAVA_PW;

const loginToStrava = async (page) => {
  const needsToAcceptCookies = await page.$('button.btn-accept-cookie-banner');

  if (needsToAcceptCookies) {
    await page.click('button.btn-accept-cookie-banner');
  }

  await page.waitForSelector('#login-button');
  await page.type('#email', username);
  await page.type('#password', password);
  await page.click('#login-button');
  await page.waitForNavigation();
};

const makeActivityPublic = async (page, id, name, date) => {
  await page.goto(`https://www.strava.com/activities/${id}/edit`);
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    const radio = document.querySelector('input[type=radio][value=followers_only]');
    radio.click();
  });

  await page.waitForTimeout(2000);
  await page.waitForSelector('.header > .container > .media > .media-right > .btn');
  await page.click('.header > .container > .media > .media-right > .btn');
  console.log({ date, id, name });
  await page.waitForTimeout(5000);
};

const getActivities = async (num) => {
  const accessToken = await authorize();
  const activitiesRoute = `${BASE_API_URL}/athlete/activities?per_page=${num}&access_token=${accessToken}`;
  const response = await fetch(activitiesRoute);
  const data = await response.json();
  const activities = data.map(({
    name,
    id,
    start_date,
    visibility
  }) => {
    const localDateTime = new Date(start_date).toLocaleString();
    return { id, name, localDateTime, visibility };
  });
  const nonPublicActivities = activities.filter(({ visibility }) => visibility === 'only_me');
  return nonPublicActivities;
};

const makeActivitiesPublic = async (num = 200) => {
  const activities = await getActivities(num);
  console.log(activities);
  if (activities.length) {
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        '--incognito'
      ]
    });
    const page = await browser.newPage();
    await page.goto('https://www.strava.com/dashboard');
    await page.setViewport({ width: 1920, height: 956 });
    await loginToStrava(page);
    await page.waitForTimeout(2000);
    for (const { id, name, localDateTime } of activities) {
      await makeActivityPublic(page, id, name, localDateTime);
    }
    await browser.close();
  }
  console.log(`finished changing visibility of ${activities.length} activities`);
};

export default makeActivitiesPublic;