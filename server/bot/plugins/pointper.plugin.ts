import * as userService from '../../services/user.service';
import * as gameService from '../../services/game.service';
import * as twitchService from '../../services/twitch.service';
import * as moment from 'moment';

const offline: number = 10;
const online: number = 25;
const interval = moment.duration(15, 'minutes');

export default class PointPer {
  constructor(public bot) {
    setInterval(this.sendPoints(), interval);
  }

  sendPoints() {
    twitchService.getChatters(chat => {
      let viewers = chat.chatters.viewers;
      let count = chat.chatter_count;

      twitchService.getStreamStatus(status => {
        if (status) userService.putDevbits(viewers.join(), online, () =>
          this.bot.say(`Thanks for watching DevWars! You've been awarded ${online} bits.`));
        else userService.putDevbits(viewers.join(), offline, () =>
          this.bot.say(`You've earned ${offline} bits! You'll earn ${offline} bits every 15 minutes whilst the stream is offline.`));
      })

    })
  }
}
