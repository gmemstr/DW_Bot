import test from 'ava';
import * as _ from 'lodash';
import environment from '../lib/environment'
import { TwitchBot } from '../lib/bot';
import {VotingPlugin} from '../lib/plugins/voting.plugin';

const bot = new TwitchBot(environment.bot);



function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const ghostVoters = [
  {
    username: 'Gastly',
    team: 'blue',
  },
  {
    username: 'Haunter',
    team: 'blue',
  },
  {
    username: 'Gengar',
    team: 'red',
  }
];

test('addVote successfully adds user to pool #unit', t => {
  const plugin = new VotingPlugin(bot);
  const ghostVoter = ghostVoters[0];
  plugin.addVote(ghostVoter.username, ghostVoter.team);
  t.deepEqual(plugin.voters.reduce(voter => voter.name === ghostVoter.name), ghostVoter);
});

test('hasVote returns true if voter is already in voters array', t => {
  const plugin = new VotingPlugin(bot);
  const ghostVoter = ghostVoters[1];
  plugin.addVote(ghostVoter.username, ghostVoter.team);
  t.true(plugin.hasVote(ghostVoter.username));
});

test.skip('endVote empties voters array', async (t) => {
  const plugin = new VotingPlugin(bot);
  const ghostVoter = ghostVoters[2];
  plugin.addVote(ghostVoter.username, ghostVoter.team);
  await plugin.closeVotes();
  t.false(plugin.hasVote(ghostVoter.username));
});


