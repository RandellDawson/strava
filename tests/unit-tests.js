import chai from 'chai';
const assert = chai.assert;

import {
  analyzeActivity,
  createSplitAndPaceTimesText,
  createNewActivityNameAndDesc,
  filterLapPaces
} from '../utils/process-event.js';


suite('Unit Tests', function(){

  suite('Function createSplitAndPaceTimesText', function() {

    test('One lap', function(done) {
      const laps = [
        { lapTime: '1:32', pace: '6:09' }
      ];
      const expectedOneLapText = '#1 - 1:32 (pace: 6:09)';
      assert .equal(createSplitAndPaceTimesText(laps), expectedOneLapText);
      done();
    });

    test('Multiple laps', function(done) {
      const laps = [
        { lapTime: '1:32', pace: '6:09' },
        { lapTime: '1:34', pace: '6:25' },
        { lapTime: '1:30', pace: '6:06' }
      ];
      const expectedMultiLapText = '#1 - 1:32 (pace: 6:09)\n#2 - 1:34 (pace: 6:25)\n#3 - 1:30 (pace: 6:06)';
      assert .equal(createSplitAndPaceTimesText(laps), expectedMultiLapText);
      done();
    });
      
    test('No laps', function(done) {
      const laps = [];
      const expectedNoLapText = '';
      assert .equal(createSplitAndPaceTimesText(laps), expectedNoLapText);
      done();
    });
  });

  suite('Function filterLapPaces', function() {

    test('', function(done) {

      done();
    });

    test('', function(done) {

      done();
    });

  });
});