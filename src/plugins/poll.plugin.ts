import { TwitchBot } from '../twitch.bot';
import { IPayload } from '../interfaces';
import {
  addPollVote, setPoll,
  switchStage,
} from '../services/firebase.service';

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
  votes: string[] = [];

  constructor(private bot: TwitchBot) {

    bot.addCommand('@poll', async (p:IPayload) => {
      if (this.isPoolOpen()) return bot.say('Poll is already open.');
      const question = this.getQuestion(p.args.join(' '));
      const options = this.getOptions(p.args.join(' '));
      if (options.length < 1) return bot.whisper(
        p.user.username, 'you need more than one option.',
      );
      await Promise.all([
        switchStage('poll'),
        setPoll(question, this.formatOptions(options)),
      ]);
      this.options = this.formatOptions(options);
      this.question = question;
    });

    // test command
    bot.addCommand('@setTestPoll', async () => {
      const string = `what IDE do you use? | option a | option b | option c`;
      const question = this.getQuestion(string);
      const options = this.formatOptions(this.getOptions(string));
      await setPoll(question, options);
      return bot.say('set test poll.');
    });

    bot.addCommand('@closePoll', () => {
      TwitchBot.sysLog('info', 'Polling results', 'poll', {
        question: this.question,
        options: this.options,
        votes: this.votes,
      });
      bot.say('Closing poll.');
      this.question = false;
      this.votes = [];
      this.options = [];
    });

    bot.addCommand(['*a', '*b', '*c', '*d', '*e', '*f', '*g'], (p:IPayload) => {
      if (!this.isPoolOpen()) return bot.say('No poll is open.');
      if (this.hasVoted(p.user.username)) return;
      const inputOption = p.command[1];
      // get option user is voting for.
      const optionLocation = PollPlugin.alphabetPosition(inputOption);
      // check if that optionLocation exists.
      if (!this.optionExists(optionLocation))
        return bot
          .whisper(p.user.username, `${inputOption[0]} is not an option.`);

      return this.addVote(p.user.username, optionLocation);
    });

  }

  private addVote(username: string, optionLocation: number) {
    this.votes.push(username);
    this.options[optionLocation].votes += 1;
    if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
      console.log(`adding: ${username} - ${optionLocation}`);
      addPollVote(optionLocation);
    }

    return;
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

  private static alphabetPosition(character: string): number {
    return character.toUpperCase().charCodeAt(0) - 65;
  }

  private optionExists(index: number) {
    return !!this.options[index];
  }

  private hasVoted(username: string) {
    return !!this.votes.includes(username);
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
