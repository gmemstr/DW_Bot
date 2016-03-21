import {updateFrame, resetFrame, VoteCategories} from "../../services/firebase.service";
import * as _ from 'lodash';

enum VoteCategoriesShortHand { d, f, t }
var voting = false;

export default function (bot) {
  bot.addCommand('@firebase', function(o) {
    // resetFrame();
    updateFrame({liveVoting: {votingOn: 'func'}});
  });

  bot.addCommand('@startvote', function(o) {
    let category = o.args[0] || 'x';
    if (VoteCategories[VoteCategoriesShortHand[category.charAt(0)]]) {
      const trueCat = VoteCategories[VoteCategoriesShortHand[category.charAt(0)]];
      console.log('trueCat ', trueCat);
    }

  });
}

