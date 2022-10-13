import { constants, createSplitAndPaceTimesText } from './index.js';

const createNewActivityNameAndDesc = ({
  avgDecPace, miles, speedLaps, tempoLaps
}) => {

  let runEffort = 'Easy Run';
  let lapSplitsText = '';
  if (miles >= 10) {
    runEffort = 'Long Run';
  } else if (speedLaps.length) {
    runEffort = 'Speed Workout';
    lapSplitsText = createSplitAndPaceTimesText(speedLaps);;
  } else if (tempoLaps.length) {
    runEffort = 'Tempo Run';
    lapSplitsText = createSplitAndPaceTimesText(tempoLaps);
  } else if (avgDecPace > 14.5) {
    runEffort = 'Walk';  
  } else if (miles <= 7 && avgDecPace > constants.RECOVERY_MIN_PACE) {
    runEffort = 'Recovery Run';
  }

  const mileageDesc = `${miles} miles`;
  const name = `${runEffort} - ${mileageDesc}`;
  const description = runEffort === 'Speed Workout' || runEffort === 'Tempo Run'
    ? `splits:\n${lapSplitsText}`
    : '';
  return { name, description };
};

export default createNewActivityNameAndDesc;