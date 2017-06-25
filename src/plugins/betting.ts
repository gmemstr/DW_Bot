import { ICommandPayload, TwitchBot } from '../bot';
export class BettingPlugin {
  constructor(bot: TwitchBot) {
    bot.addCommand('*testBet', (o: ICommandPayload) => {
      bot.say('test bet command');
    });
  }

  public test() {

  }
}
