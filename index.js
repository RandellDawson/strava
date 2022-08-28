import { Command } from 'commander';
import { updateActivities } from './utils/index.js';
const program = new Command();

program
  .name('strava-updater')
  .description('CLI to perform various updates to my Strava account');

program.command('update-wu-cd')
  .description('Changes activities with names ending with ** or *** to applicable warmups and cooldowns descriptions')
  .argument('[num]', 'Number of activities to analyze')
  .action((num) => {
    updateActivities(num);
  });

program.parse();