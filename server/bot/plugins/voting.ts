import {updateFrame, resetFrame, VoteCategories, addVoteOnFrame} from "../../services/firebase.service";
import * as _ from 'lodash';

enum VoteCategoriesShortHand { d, f, t }
var voting = undefined;
var voters = [];

export default function (bot) {

  function startVote(cat: string) {
    voting = {
      votingOn: cat
    };
    voting[cat] = {
      red: 0,
      blue: 0
    };
    updateFrame({ liveVoting: voting });

    bot.say(`Voting is now open for ${cat}. Use '!red' or '!blue' to vote.`);
  }

  function addVote(user: string, color: string, cat = '') {
    if (!voting) return bot.say('Voting is closed');

    if (voters.indexOf(user) === -1) {
      voting[voting.votingOn][color] ++;
      addVoteOnFrame(color, voting.votingOn, 1);
      voters.push(user);
      console.log('voting ', voting)
    } else {
      bot.whisper(user, 'You can only vote once.');
    }
  }

  bot.addCommand('@firebase', function(o) {
    // resetFrame();
    updateFrame({liveVoting: {votingOn: 'func'}});
  });

  bot.addCommand('@startvote', function(o) {
    let category = o.args[0] || 'x';
    if (!voting || VoteCategories[VoteCategoriesShortHand[category.charAt(0)]]) {
      const trueCat = VoteCategories[VoteCategoriesShortHand[category.charAt(0)]];
      console.log('trueCat ', trueCat);
      startVote(trueCat);
    }

  });

  bot.addCommand('*red', o => addVote(o.from, 'red', voting.votingOn));
  bot.addCommand('*blue', o => addVote(o.from, 'blue'));
}

