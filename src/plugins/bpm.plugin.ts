import { TwitchBot } from '../bot';
import { putBits } from '../services/user.service';
import { getStreamInfo, getViewers } from '../services/twitch.service';
import { IPayload } from '../interfaces';

export class BPMPlugin {
  private offline = 2;
  private online = 10;
  private loop: number = TwitchBot.ms(20, 'minutes');

  constructor(private bot: TwitchBot) {
    bot.addCommand('@bpm', async (p:IPayload) => {
      const amount = p.args[0] || this.online;
      return this.giveBits(amount);
    });

    setTimeout(() => {
      setInterval(() => this.giveBits(this.online), this.loop);
    }, TwitchBot.ms(1, 'minutes'));

  }

  private async giveBits(amount: number) {
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
      return putBits(chatters.join(), amount).then(() => {
        return this.bot.say(`Everyone has received ${amount} Bits.`);
      });
    }
  }

}
