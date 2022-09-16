import { constants } from './index.js';

const analyzeActivity = (activity) => {
  const { moving_time: totalTime, distance: meters, laps } = activity;
  const miles = Number((meters / 1609.344).toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]);
  const avgDecPace = (totalTime / 60) / miles;
  const lapPaces = laps.map(({ distance, moving_time: lapTime }) => {
    const paceDec = lapTime / 60;
    const timeMins = Math.floor(paceDec);
    const timeSecs = ((paceDec - timeMins) * 60).toFixed(0);
    const mileage = distance / 1609.344;
    const pacePerMile = paceDec / mileage;
    const paceMins = Math.floor(pacePerMile);
    const paceSecs = ((pacePerMile - paceMins) * 60).toFixed(0);
    const paceStr = `${paceMins}:${paceSecs.padStart(2, '0')}`;
    return {
      lapTime: `${timeMins}:${timeSecs.padStart(2, '0')}`,
      pacePerMile,
      pace: paceStr,
      mileage
    };
  });
  
  const speedLaps = lapPaces.filter(({ pacePerMile, mileage }) => {
    return pacePerMile < constants.SPEED_MAX_PACE &&
      mileage >= constants.SPEED_MIN_MILEAGE &&
      mileage <= constants.SPEED_MAX_MILEAGE;
  });

  const tempoLaps = lapPaces.filter(({ pacePerMile, mileage }) => {
    return pacePerMile < constants.TEMPO_MAX_PACE &&
      mileage >= constants.TEMPO_MIN_MILEAGE;
  });

  return {
    miles,
    avgDecPace,
    speedLaps,
    tempoLaps
  };
};

export default analyzeActivity;