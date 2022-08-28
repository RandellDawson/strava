import { Command } from 'commander';
import { updateActivities, makeActivitiesPublic } from './utils/index.js';
const program = new Command();

program
  .name('strava-updater')
  .description('CLI to perform various updates to my Strava account');

program.command('update-wu-cd')
  .description('Changes activities with names ending with ** or *** to applicable warmups and cooldowns descriptions')
  .argument('[num]', 'Number of activities to analyze')
  .action(updateActivities);

program.command('make-activities-public')
  .description('Changes activities with viewable status "Only Me" to "Everyone"')
  .argument('[num]', 'Number of activities to analyze')
  .action(makeActivitiesPublic);

program.parse();