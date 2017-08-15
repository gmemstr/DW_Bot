import { IPayload, TwitchBot } from '../bot';
import { putBits } from '../services/user.service';
import { getStreamInfo, getViewers } from '../services/twitch.service';
import * as moment from 'moment';

export class BPMPlugin {
  private offline = 2;
  private online = 10;
  private loop: number = this.ms(30, 'minutes');

  constructor(private bot: TwitchBot) {
    bot.addCommand('@bpm', async () => {
      console.log(`bpm command:`);
      return this.giveBits();
    });

    setTimeout(() => {
      setInterval(() => this.giveBits(), this.loop);
    }, this.ms(1, 'minutes'));

  }

  private async giveBits() {
    console.log(`giveBits()`);
    // get everyone's usernames that are in chat.
    const viewers = await getViewers();
    if (viewers) {
      const chatters = [
        ...viewers.chatters.moderators,
        ...viewers.chatters.staff,
        ...viewers.chatters.admins,
        ...viewers.chatters.global_mods,
        ...viewers.chatters.viewers,
      ];
      // get if stream is online or offline.
      const status = await getStreamInfo();
      if (!status.viewers) {
        // stream is offline
        return putBits(chatters.join(), this.offline).then(() => {
          return this.bot.say(`Everyone has received ${this.offline} Bits.`);
        });
      } else if (status.viewers) {
        return putBits(chatters.join(), this.online).then(() => {
          return this.bot.say(`Everyone has received ${this.online} Bits!`);
        });
      }
    }
  }

  private ms(duration: number, measurement: 'minutes' | 'seconds' = 'minutes') {
    return moment.duration(duration, measurement).asMilliseconds();
  }

}
