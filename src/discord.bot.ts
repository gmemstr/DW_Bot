import { EventEmitter } from 'events';
import * as Rx from '@reactivex/rxjs';
import { DPayload, ICommand, IUser } from './interfaces';
const discord = require('discord.js');
import { Message, User } from 'discord.js';
import { TwitchBot, UserType } from './twitch.bot';


export class DiscordBot {
  // Different Streams that are connected to Event Emitters. & for discord
  public $ = {
    IncChat: '&_IncChat$',
    OutChat: '&_OutChat$',
    IncWhisper: '&_IncWhisper$',
    OutWhisper: '&_OutWhisper$',
  };
  public client: any;
  public commands: {[key: string]: ICommand} = {};
  public userGroups: [string] = ['*', '$', '@'];
  public botEE: EventEmitter;

  constructor(private config: {[key: string]: any}) {
    this.botEE = new EventEmitter();
    this.client = new discord.Client();

    Rx.Observable.fromEvent(this.botEE, this.$.IncChat, (obj: any) => obj)
      .filter((input: Message) => this.isCommand(input.content))
      // .filter((input: Message) =>
      //   this.checkDebounce(TwitchBot.normalizeMessage(input.content)))
      // .filter((input: Message) => this.checkPermissions(input))
      .map((input: Message) => this.formatInput(input))
      .do((input) => {
        console.log(`input`);
        console.log(input);
      })
      .subscribe(input => console.log(`${input}`));
  }

  public async say(message: string, ch: string) {

  }

  public addCommand(
    command: string | string[], action: Function, debounce: number = 0) {
    if (Array.isArray(command)) {
      return command.map(cmd => this.addCommand(cmd, action, debounce));
    }
    // unlike twitch commands, discord commands will start with &.
    // When adding a command, you can specify what 'kind' of command it is.
    // 'D*' means everyone can use it.
    // ... and so on, similar to twitch.addCommand

    // check for discord mod.
    if (command[0] !== 'D') return;
    // check for identifier
    if (!this.userGroups.includes(command[1])) return;
    // if all checks pass, add this command to the object of commands.
    const string = command.substr(2).toLowerCase();
    return this.commands[string] = {
      action,
      debounce,
      string,
      reqRights: this.userGroups.indexOf(command[1]),
      lastExe: 0,
    };

  }

  public isCommand(command: string): boolean {
    console.log(`is command? ${command}`);
    // See if input message begins with command character &&
    // See if input message is longer than command character.
    return command[0] === this.config.commandCharacter &&
      command.trim().length > this.config.commandCharacter.length;
  }

  public async connect(): Promise<void> {
    await this.client.login(this.config.token);

    this.client.on('message', (message: Message) => {
      this.botEE.emit(this.$.IncChat, message);
    });
    return;
  }


  // ch: string;
  // user: IUser;
  // msg: string;
  // self: boolean;
  // action: any;
  private formatInput(input: Message): DPayload {
    const user: User = input.author;
    return {
      user,
      ch: input.channel.id,
      command: TwitchBot.normalizeMessage(input.content),
      channel: input.channel,
      args: this.getArgumentsFromMsg(input.content),
      start: Date.now(),
      member: input.member,
      reply: input.reply,
    };
  }

  private checkDebounce(command: string): boolean {
    try {
      const string = command.substr(2);
      if (!this.commands[string].action) return false;
      const currentTime = Date.now();
      const debounce = this.commands[string].debounce || 0;
      const timePastSinceLastExe = currentTime - this.commands[string].lastExe;
      return timePastSinceLastExe > debounce;
    } catch (e) {
      return false;
    }
  }

  /**
   * @method getArgumentsFromMsg
   * @description Used for formatting input message command arguments.
   * @param {string} inputMsg - message that needs to be converted.
   * @return {[string] | false} - args or false if no args are present.
   */
  private getArgumentsFromMsg(inputMsg: string): any[] {
    try {
      const array = inputMsg.split(' ').splice(1);
      if (array.length < 1) return [];
      return array.map((item) => {
        if (item.match(/^\d+$/)) {
          return Number(item);
        } else {
          if (item.includes('key')) {
            return item.toString();
          } else {
            return item.toString().toLowerCase();
          }
        }
      });
    } catch (e) { return []; }
  }

  private checkPermissions(input: Message): boolean {
    try {
      const string = TwitchBot.normalizeMessage(input.content);
      const memberRole = input.member;
      console.log(`memberRole`);
      console.log(memberRole);
      // switch (this.commands[string].reqRights) {
      //   case UserType.Normal:     return true;
      //   case UserType.Subscriber: return true;
      // }
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
