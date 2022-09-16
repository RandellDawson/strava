const createSplitAndPaceTimesText = (laps) => laps
  .map(({ lapTime, pace }, index) => `#${index + 1} - ${lapTime} (pace: ${pace})`)
  .join('\n');

export default createSplitAndPaceTimesText;