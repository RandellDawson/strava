import dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch';

const baseAPIUrl = 'https://www.strava.com/api/v3';
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const refreshToken = process.env.REFRESH_TOKEN;

const App = () => {
  const getActivities = async () => {
    const accessToken = await reAuthorize();
    const activitiesRoute = `${baseAPIUrl}/athlete/activities?per_page=100&access_token=${accessToken}`;
    const response = await fetch(activitiesRoute);
    const data = await response.json();
    const activities = data.map(({
      name,
      id,
      start_date
    }) => {
      const localDateTime = new Date(start_date).toLocaleString();
      return { id, name, localDateTime };
    });
    const warmupsAndCooldowns = activities.filter(({ name }) => name.endsWith('**'));
    return warmupsAndCooldowns;
  };

  const reAuthorize = async () => {
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

  const updateActivity = async (id, name) => {
    const accessToken = await reAuthorize();
    const regex = /^(?<runType>\w+\s+\w+)\s*-\s*(?<mileageDesc>[\d\.]+\s+\w+)\s*(?<numStars>\s*\*+)$/i;
    const match = name.match(regex);
    if (match) {
      const { mileageDesc, numStars } = match.groups;
      const activityType = numStars.length === 2
        ? 'Warm Up'
        : 'Cool Down'
      const newName = `${activityType} Run - ${mileageDesc}`;
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
      // const response = await fetch(`${baseAPIUrl}/activities/${id}`, requestOptions);
      // const data = await response.json();
      // console.log(data);
      console.log({id, name, newName});
    }
  };
  
  const updateActivities = async() => {
    const wuAndCd = await getActivities();
    for (const { id, name } of wuAndCd) {
      await updateActivity(id, name);
    }
  };

  return {
    getActivities,
    updateActivities
  }
};


const app = App();

app.updateActivities();

