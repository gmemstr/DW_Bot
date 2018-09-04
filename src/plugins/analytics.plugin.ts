import { TwitchBot } from '../twitch.bot';
import { getViewers } from '../services/twitch.service';
import { saveAnalytics } from '../services/firebase.service';

export class AnalyticsPlugin {
  private loop: number = TwitchBot.ms(3, 'minutes');

  constructor() {
    setTimeout(() => {
      setInterval(async () => {
        const viewers = await getViewers();
        if (viewers) {
          saveAnalytics(viewers);
          console.log(`saving analytics`);
        }
      }, this.loop);
    }, TwitchBot.ms(1, 'minutes'));
  }

}
