import {updateFrame, resetFrame, VoteCategories, addVoteOnFrame} from "../../services/firebase.service";
import {postVotes, getCurrentGameId, currentGame} from '../../services/game.service';
import * as moment from 'moment';


enum VoteCategoriesShortHand { d, f, t }
var voting = undefined;
var voters = [];

var votingDuration = moment.duration(3, 'minutes');

function getPercentage(teamCount: number) {
  return Math.round((teamCount / voters.length) * 100)
}


export default class Voting {
  voting: any = undefined;
  voters: Object[] = [];

  constructor(public bot) {
    bot.addCommand('@startvote', function (o) {
      let category = o.args[0] || 'x';
      if (!voting || VoteCategories[VoteCategoriesShortHand[category.charAt(0)]]) {
        const trueCat = VoteCategories[VoteCategoriesShortHand[category.charAt(0)]];
        console.log('trueCat ', trueCat);
        this.startVote(trueCat);
      }
    });

    bot.addCommand('*red', o => this.addVote(o.from, 'red'));
    bot.addCommand('*blue', o => this.addVote(o.from, 'blue'));
    bot.addCommand('@votetest', o => bot.say('test voting command'));
  };

  startVoteTimer() {
    let timerInit = setInterval(() => {
      votingDuration = moment.duration(votingDuration.asMinutes() - 1, 'minutes');

      if (votingDuration.asMinutes() <= 0 || !this.voting) {
        this.endVote();
        clearInterval(timerInit)
      }

      else if(votingDuration.asMinutes() === 1) {
        this.bot.say(`${votingDuration.asMinutes()} minute left to vote !red or !blue.`)
      }

    }, 60000)
  };

  startVote(cat: string) {
    console.log("StartVote in  class!");
    voting = 'something';
    this.voting = {
      votingOn: cat
    };
    this.voting[cat] = {
      red: 0,
      blue: 0
    };

    updateFrame({ liveVoting: this.voting });
    this.bot.say(`Voting is now open for ${cat}. Use "!red" or "!blue" to vote.`);
  }



  addVote(user: string, color: string) {
    if (!this.voting) return this.bot.say('Voting is closed');
    if (this.voters.indexOf(user) === -1) {
      this.voting[this.voting.votingOn][color] ++;
      addVoteOnFrame(color, this.voting.VotingOn, 1);
      this.voters.push(user);
    } else {
      this.bot.whisper(user, 'You can only vote once.');
    }
  }


  async endVote() {
    const cat = this.voting.votingOn;
    const votes = this.voting[cat];
    const gameId = await currentGame();
    this.bot.say(`Blue: ${getPercentage(voting[voting.votingOn].blue)}% || ${getPercentage(voting[voting.votingOn].red)}% :Red`);
    //TODO: send results to server and reset voting.
  }

};

