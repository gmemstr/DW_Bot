import {  getViewers } from '../services/twitch.service';
import { saveAnalytics } from '../services/firebase.service';
import botUtils from '../common/bot.utils';

export class AnalyticsPlugin {
  private loop: number = botUtils.ms({ minutes: 3 });

  constructor() {
    setTimeout(() => {
      setInterval(async () => {
        const viewers = await getViewers();
        if (viewers) {
          saveAnalytics(viewers);
          console.log(`saving analytics`);
        }
      }, this.loop);
    }, botUtils.ms({ minutes: 10 }));
  }

}
