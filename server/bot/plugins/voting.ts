import {updateFrame, resetFrame} from "../../services/firebase.service";

export default function (bot) {
  bot.addCommand('@firebase', function(o) {
    // resetFrame();
    updateFrame({liveVoting: {votingOn: 'func'}});
  });
}

