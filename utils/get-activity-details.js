import { constants, request } from './index.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getActivityDetails = async (id, accessToken) => {
  const maxAttempts = 6;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const data = await request({
        method: 'get',
        url: `${constants.BASE_API_URL}/activities/${id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (data?.id) {
        return data;
      }

      throw new Error(`Unexpected activity payload for ${id}: ${JSON.stringify(data)}`);
    } catch (error) {
      const isNotReadyYet =
        error?.status === 404 ||
        error?.data?.message === 'Record Not Found';

      if (!isNotReadyYet || attempt === maxAttempts) {
        throw error;
      }

      const delayMs = attempt * 1500;
      console.log(
        `Activity ${id} not ready yet (attempt ${attempt}/${maxAttempts}). Retrying in ${delayMs}ms...`
      );
      await sleep(delayMs);
    }
  }
};

export default getActivityDetails;