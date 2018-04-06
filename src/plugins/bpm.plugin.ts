import { TwitchBot } from '../twitch.bot';
import { putBits } from '../services/user.service';
import { getStreamInfo, getViewers } from '../services/twitch.service';
import { IPayload } from '../interfaces';
import { getBPMValue } from '../services/firebase.service';

export class BPMPlugin {
  private defaultCoins = 10;
  private loop: number = TwitchBot.ms(20, 'minutes');

  constructor(private bot: TwitchBot) {
    bot.addCommand('@bpm', async (p:IPayload) => {
      const amount = p.args[0] || await getBPMValue() || this.defaultCoins;
      return this.giveBits(amount);
    });

    setTimeout(() => {
      setInterval(async () =>
        this.giveBits(await getBPMValue() || this.defaultCoins), this.loop);
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
