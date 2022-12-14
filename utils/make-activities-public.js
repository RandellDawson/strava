import puppeteer from 'puppeteer';
import { constants, authorize, getActivities } from './index.js';

const loginToStrava = async (page) => {
  const needsToAcceptCookies = await page.$('button.btn-accept-cookie-banner');

  if (needsToAcceptCookies) {
    await page.click('button.btn-accept-cookie-banner');
  }

  await page.waitForSelector('#login-button');
  await page.type('#email', constants.STRAVA_USERNAME);
  await page.type('#password', constants.STRAVA_PASSWORD);
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

const getNonPublicActivities = async (num) => {
  const accessToken = await authorize();
  const data = await getActivities(accessToken, num);
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

const makeActivitiesPublic = async (num) => {
  const activities = await getNonPublicActivities(num);
  console.log(activities);

  if (activities.length) {
    const browser = await puppeteer.launch({
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