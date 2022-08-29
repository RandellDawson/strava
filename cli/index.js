import { Command } from 'commander';
import { updateStarredActivitiesToWUCD, makeActivitiesPublic } from '../utils/index.js';
const program = new Command();

program
  .name('cli')
  .description('CLI to perform various updates to my Strava account');

program.command('wu-cd')
  .description('Changes activities with names ending with ** or *** to applicable warmup and cooldown descriptions')
  .argument('[num]', 'Number of activities to analyze')
  .action(updateStarredActivitiesToWUCD);

program.command('make-public')
  .description('Changes activities with viewable status "only_me" to "followers_only"')
  .argument('[num]', 'Number of activities to analyze')
  .action(makeActivitiesPublic);

program.parse();