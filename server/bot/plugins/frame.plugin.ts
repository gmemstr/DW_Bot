import {addTime, startTimer, resetFrame} from "../../services/firebase.service";
import * as moment from 'moment';


export default class Frame {
  constructor(bot) {
    bot.addCommand('@startTimer', o => startTimer());

    bot.addCommand('@addTime', o => {
      let amount = o.args[0];
      addTime(amount, (res) => {
        res ? bot.whisper(o.from, `Added ${res} minute(s) to the game clock.`) : bot.whisper(o.from, 'Something went wrong when adding time, please try the command again.');
      })
    });

    bot.addCommand('@resetFrame', o => resetFrame());
  }
}

