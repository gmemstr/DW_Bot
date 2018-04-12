import { TwitchBot } from '../twitch.bot';
import { IPayload } from '../interfaces';

export class PollPlugin {
  pipe = (...args) => args.reduce((prev, curr) => curr(prev));
  question: string = '';
  options: string[] = [];

  constructor(private bot: TwitchBot) {

    bot.addCommand('@poll', (p:IPayload) => {
      if (this.isPoolOpen()) return bot.say('Pool is already open.');
      const question = this.getQuestion(p.args.join(''));
      const options = this.getOptions(p.args.join(''));
    });

  }

  private isPoolOpen(): boolean {
    return this.question.length > 2;
  }

  private getQuestion(input: string): string | false {
    try {
      return this.pipe(input,
        // take out options, leaving only the question.
        ((i: string) => i.split('|')[0]),
        // trim string.
        ((i: string) => i.trim()),
        // cap the first letter in question
        ((i: string) => i.charAt(0).toUpperCase() + i.slice(1)),
        );
    } catch (e) {
      return false;
    }
  }

  private getOptions(input: string): string[] | false {
    try {
      return this.pipe(input,
        // split question + options input string into array.
        ((i: string) => i.split['|']),
        // take out question.
        ((arr: string[]) => arr.slice(1)),
        // trim all options
        // ((arr: string[]) => arr.map(question => question.trim())),
        );
    } catch (e) {
      console.warn(e)
      return false;
    }
  }

}
