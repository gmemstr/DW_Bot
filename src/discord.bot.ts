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
  public userGroups: string[] = ['*', '$', '@'];
  public botEE: EventEmitter;

  constructor(private config: {[key: string]: any}) {
    this.botEE = new EventEmitter();
    this.client = new discord.Client();

    Rx.Observable.fromEvent(this.botEE, this.$.IncChat, (obj: any) => obj)
      .filter((input: Message) => this.isCommand(input.content))
      // .filter((input: Message) =>
      //   this.checkDebounce(TwitchBot.normalizeMessage(input.content)))
      .filter((input: Message) => this.checkPermissions(input))
      .map((input: Message) => this.formatInput(input))
      .do((payload: DPayload) => this.doCommand(payload))
      .subscribe(input => console.log(`${input}`));
  }

  public async say(message: string, channel: any) {
    await channel.send(message);
    return;
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
    // See if input message begins with command character &&
    // See if input message is longer than command character.
    return command[0] === this.config.commandCharacter &&
      command.trim().length > this.config.commandCharacter.length;
  }

  public async doCommand(payload: DPayload): Promise<boolean> {
    try {
      const command: ICommand = this.commands[payload.command.substr(1)];
      await command.action.call(this, payload);
      command.lastExe = Date.now();
      return true;
    } catch (e) {
      TwitchBot.sysLog('error', 'Problem executing command doCommand()', '~', {
        payload,
        error: e,
        discord: true,
      });
      return false;
    }
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
    console.log(`input`);
    console.log(input);
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

  /**
   * @method normalizeCommand
   * @description Used to trim and lowercase incoming messages
   *              before attempting to call them in list of commands.
   *              This is a lot like TwitchBot.normalize message but we have to
   *              remove extra characters because of the discord modifier
   * @param {string} inputMsg - message that needs to be converted.
   * @return {string} - return command.
   */
  private static normalizeMessage(inputMsg: string) {
    const message = TwitchBot.normalizeMessage(inputMsg);
    // take out extra character that is placed in for discord modifier.
    return message.split('!')[1];
  }

  private checkPermissions(input: Message): boolean {
    try {
      const string = DiscordBot.normalizeMessage(input.content);
      const roles = input.member.roles;
      switch (this.commands[string].reqRights) {
        case UserType.Normal:     return true;
        case UserType.Mod: return !!roles.find('name', 'mod') ||
                                  !!roles.find('name', 'administrators');
      }
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
