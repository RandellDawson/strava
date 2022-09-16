import chai from 'chai';
const assert = chai.assert;

import {
  analyzeActivity,
  createSplitAndPaceTimesText,
  createNewActivityNameAndDesc
} from '../utils/process-event.js';

import speedWorkActivity from './__fixtures__/speed-work-activity.js';
import tempoRunActivity from './__fixtures__/tempo-run-activity.js';

suite('Unit Tests', function(){

  suite('Function createSplitAndPaceTimesText', function() {

    test('One lap', function(done) {
      const laps = [
        { lapTime: '1:32', pace: '6:09' }
      ];
      const expectedOneLapText = '#1 - 1:32 (pace: 6:09)';
      assert.equal(createSplitAndPaceTimesText(laps), expectedOneLapText);
      done();
    });

    test('Multiple laps', function(done) {
      const laps = [
        { lapTime: '1:32', pace: '6:09' },
        { lapTime: '1:34', pace: '6:25' },
        { lapTime: '1:30', pace: '6:06' }
      ];
      const expectedMultiLapText = '#1 - 1:32 (pace: 6:09)\n#2 - 1:34 (pace: 6:25)\n#3 - 1:30 (pace: 6:06)';
      assert.equal(createSplitAndPaceTimesText(laps), expectedMultiLapText);
      done();
    });
      
    test('No laps', function(done) {
      const laps = [];
      const expectedNoLapText = '';
      assert.equal(createSplitAndPaceTimesText(laps), expectedNoLapText);
      done();
    });
  });

  suite('Function analyzeActivity', function() {
    const speedAnalsyis = analyzeActivity(speedWorkActivity.data);
    console.log(speedAnalsyis);
    test('miles should be a number', function(done) {
      assert.typeOf(speedAnalsyis.miles, 'number');
      done();
    });

    test('speedLaps should be a non-empty array', function(done) {
      assert.typeOf(speedAnalsyis.speedLaps, 'array');
      assert(speedAnalsyis.speedLaps.length);
      done();
    });

    test('Each element of speedLaps should be an object containing 4 properties', function(done) {
      assert(speedAnalsyis.speedLaps.every(elem => typeof elem === 'object' && Object.keys(elem).length === 4));
      done();
    });

    test(`A lap object has a lapTime property of type String,
    a pacePerMile property of type Number, a pace property of type String,
    and a mileage property of type Number`
, function(done) {
      const lapTime = speedAnalsyis.speedLaps[0]?.lapTime;
      assert(lapTime && typeof lapTime === 'string');
      const pacePerMile = speedAnalsyis.speedLaps[0]?.pacePerMile;
      assert(pacePerMile && typeof pacePerMile === 'number');
      const pace = speedAnalsyis.speedLaps[0]?.pace;
      assert(pace && typeof pace === 'string');
      const mileage = speedAnalsyis.speedLaps[0]?.mileage;
      assert(mileage && typeof mileage === 'number');
      done();
    });

    test('Mock speed workout produces expected results', function(done) {
      assert.equal(speedAnalsyis.miles, speedWorkActivity.expectedMiles);
      assert.deepEqual(speedAnalsyis.speedLaps, speedWorkActivity.expectedSpeedLaps);
      done();
    });

    const tempoAnalsyis = analyzeActivity(tempoRunActivity.data);
    console.log(tempoAnalsyis)
    test('miles should be a number', function(done) {
      assert.typeOf(tempoAnalsyis.miles, 'number');
      done();
    });

    test('tempoLaps should be a non-empty array', function(done) {
      assert.typeOf(tempoAnalsyis.tempoLaps, 'array');
      assert(tempoAnalsyis.tempoLaps.length);
      done();
    });

    test('Each element of tempoLaps should be an object containing 4 properties', function(done) {
      assert(tempoAnalsyis.tempoLaps.every(elem => typeof elem === 'object' && Object.keys(elem).length === 4));
      done();
    });

    test(`A lap object has a lapTime property of type String,
           a pacePerMile property of type Number, a pace property of type String,
           and a mileage property of type Number`
    , function(done) {
      const lapTime = tempoAnalsyis.tempoLaps[0]?.lapTime;
      assert(lapTime && typeof lapTime === 'string');
      const pacePerMile = tempoAnalsyis.tempoLaps[0]?.pacePerMile;
      assert(pacePerMile && typeof pacePerMile === 'number');
      const pace = tempoAnalsyis.tempoLaps[0]?.pace;
      assert(pace && typeof pace === 'string');
      const mileage = tempoAnalsyis.tempoLaps[0]?.mileage;
      assert(mileage && typeof mileage === 'number');
      done();
    });

    test('Mock tempo run produces expected results', function(done) {
      assert.equal(tempoAnalsyis.miles, tempoRunActivity.expectedMiles);
      assert.deepEqual(tempoAnalsyis.tempoLaps, tempoRunActivity.expectedTempoLaps);
      done();
    });    
  });
  suite('Function createNewActivityNameAndDesc', function() {
    test(`Activity with 12 miles should be named "Long Run - 12 miles" and
          description should be an empty string`,
    function(done) {
      const { name: activityName, description } = createNewActivityNameAndDesc({
        avgDecPace: 9.75, miles: 12, speedLaps: [], tempoLaps: []
      });
      assert.equal(activityName, 'Long Run - 12 miles');
      assert.equal(description, '');
      done();
    });

    test('Activity with speed laps should have a name starting with "Speed Workout" and applicable splits in description', function(done) {
      const { name: activityName, description } = createNewActivityNameAndDesc({
        avgDecPace: 9,
        miles: 5,
        speedLaps: [
          {
            lapTime: '1:32',
            pacePerMile: 6.147022718214429,
            pace: '6:09',
            mileage: 0.24944325141175533
          },
          {
            lapTime: '1:34',
            pacePerMile: 6.416678797750236,
            pace: '6:25',
            mileage: 0.24415538256581562
          },
          {
            lapTime: '1:30',
            pacePerMile: 6.093076554178551,
            pace: '6:06',
            mileage: 0.24618105265250934
          }
        ],
        tempoLaps: []
      });
      assert.isTrue(activityName.startsWith('Speed Workout'));
      assert.equal(description, 'splits:\n#1 - 1:32 (pace: 6:09)\n#2 - 1:34 (pace: 6:25)\n#3 - 1:30 (pace: 6:06)')
      done();
    });

    test('Activity with tempo laps should have a name starting with "Tempo Run" and applicable splits in description', function(done) {
      const { name: activityName, description } = createNewActivityNameAndDesc({
        avgDecPace: 9.25,
        miles: 8,
        speedLaps: [],
        tempoLaps: [
          {
            lapTime: '7:38',
            pacePerMile: 7.633352305914227,
            pace: '7:38',
            mileage: 0.999997514515231
          },
          {
            lapTime: '7:37',
            pacePerMile: 7.61668559782271,
            pace: '7:37',
            mileage: 0.999997514515231
          },
          {
            lapTime: '7:28',
            pacePerMile: 7.466685224999068,
            pace: '7:28',
            mileage: 0.999997514515231
          }
        ]
      });
      assert.isTrue(activityName.startsWith('Tempo Run'));
      assert.equal(description, 'splits:\n#1 - 7:38 (pace: 7:38)\n#2 - 7:37 (pace: 7:37)\n#3 - 7:28 (pace: 7:28)')
      done();
    });

    test(`Activity with less than 10 miles, has no speed or tempo laps, and has average pace less than or equal to 9:50 /mile should have
          a name starting with "Easy Run" and description should be an empty string`,
    function(done) {
      const { name: activityName, description } = createNewActivityNameAndDesc({
        avgDecPace: 9.8, miles: 9, speedLaps: [], tempoLaps: []
      });
      assert.isTrue(activityName.startsWith('Easy Run'));
      assert.equal(description, '');
      done();
    });

    test(`Activity with less than 10 miles, has no speed or tempo laps, and has average pace greater than RECOVERY_MIN_PACE should have
          a name starting with "Easy Run" and description should be an empty string`,
    function(done) {
      const { name: activityName, description } = createNewActivityNameAndDesc({
        avgDecPace: 10, miles: 9, speedLaps: [], tempoLaps: []
      });
      assert.isTrue(activityName.startsWith('Easy Run'));
      assert.equal(description, '');
      done();
    });    

    test(`Activity with less than or equal to 7 miles, has no speed or tempo laps, and has average pace greater than RECOVERY_MIN_PACE should have
          a name starting with "Recovery Run" and description should be an empty string`,
    function(done) {
      const { name: activityName, description } = createNewActivityNameAndDesc({
        avgDecPace: 9.85, miles: 6.9, speedLaps: [], tempoLaps: []
      });
      assert.isTrue(activityName.startsWith('Recovery Run'));
      assert.equal(description, '');
      done();
    });   
    
    test(`Activity with less than or equal to 7 miles, has no speed or tempo laps, and has average pace less than RECOVERY_MIN_PACE should have
          a name starting with "Easy Run" and description should be an empty string`,
    function(done) {
      const { name: activityName, description } = createNewActivityNameAndDesc({
        avgDecPace: 9.5, miles: 6.9, speedLaps: [], tempoLaps: []
      });
      assert.isTrue(activityName.startsWith('Easy Run'));
      assert.equal(description, '');
      done();
    });   
  });
});