import { TwitchBot } from '../twitch.bot';
import { IPayload } from '../interfaces';

interface IOption {
  text: string;
  votes: number;
}
interface IOptions {
  [key: number]: IOption;
}

export class PollPlugin {
  pipe = (...args) => args.reduce((prev, curr) => curr(prev));
  question: string | boolean = false;
  options: IOptions = [];

  constructor(private bot: TwitchBot) {

    bot.addCommand('@poll', (p:IPayload) => {
      if (this.isPoolOpen()) return bot.say('Poll is already open.');
      const question = this.getQuestion(p.args.join(''));
      const options = this.getOptions(p.args.join(''));
      if (options.length < 1) return bot.whisper(
        p.user.username, 'you have to have more than one option.',
      );
      // TODO: you left off here.
      this.options = this.formatOptions(options);
    });

    bot.addCommand('*vote', (p:IPayload) => {
      // if (!this.isPoolOpen()) return bot.say('No poll is open.');
      const inputOption = p.args[0];
      // check if inputOption letter exists.
      if (!inputOption[0]) return bot.whisper(
        p.user.username, 'Select by using: !vote [option]',
      );
      // get option user is voting for.
      const optionLocation = PollPlugin.alphabetPosition(inputOption[0]);
    });

  }

  private isPoolOpen(): boolean {
    return !!this.question;
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

  private getOptions(input: string): string[] {
    try {
      return this.pipe(input,
        // split question + options input string into array.
        ((i: string) => i.split('|')),
        // take out question.
        ((arr: string[]) => arr.slice(1)),
        // trim all options
        ((arr: string[]) => arr.map(question => question.trim())),
        // take out any 'questions' that are empty.
        ((arr: string[]) => arr.filter(question => question.length > 1)),
        );
    } catch (e) {
      console.warn(e);
      return [];
    }
  }

  private static alphabetPosition(character: string) {
    return character.toUpperCase().charCodeAt(0) - 65;
  }

  /**
   * @method formatOptions
   * @param {string[]} options - options array.
   * @return {Object} - Object that matches words with letters.
   *                    example: option[0] will be !a
   */
  private formatOptions(options: string[]) {
    const object = {};
    options.forEach((option, idx) => {
      object[idx] = {
        text: option,
        votes: 0,
      };
    });
    return object;
  }

}
