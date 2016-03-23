import {updateFrame, resetFrame, VoteCategories, addVoteOnFrame} from "../../services/firebase.service";
import * as moment from 'moment';


enum VoteCategoriesShortHand { d, f, t }
var voting = undefined;
var voters = [];

var votingDuration = moment.duration(3, 'minutes');

function getPercentage(teamCount: number) {
  return Math.round((teamCount / voters.length) * 100)
}

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

  function endVote() {
    bot.say(`Blue: ${getPercentage(voting[voting.votingOn].blue)}% || ${getPercentage(voting[voting.votingOn].red)}% :Red`);
    //TODO: send results to server.
  }

  function startTimer() {
    let timerInit = setInterval(() => {
      votingDuration = moment.duration(votingDuration.asMinutes() - 1, 'minutes');

      if (votingDuration.asMinutes() <= 0 || !voting) {
        endVote();
        clearInterval(timerInit)
      }

      else if(votingDuration.asMinutes() === 1) {
        bot.say(`${votingDuration.asMinutes()} minute left to vote !red or !blue.`)
      }

    }, 60000)
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

