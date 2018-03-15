import { EventEmitter } from 'events';
import * as Rx from '@reactivex/rxjs';
import {
  IChatLog, ICommand, IInput, ILog, IPayload,
  IUser,
} from './interfaces';
import { saveChatLog, saveSystemLog } from './services/firebase.service';
import * as moment from 'moment';
const irc = require('tmi.js');

export enum UserType {
  Normal,
  Subscriber,
  Mod,
}

// Different Streams that are connected to Event Emitters.
const $ = {
  IncChat: 'IncChat$',
  OutChat: 'OutChat$',
  IncWhisper: 'IncWhisper$',
  OutWhisper: 'OutWhisper$',
  ChatLog: 'ChatLog$',
};


export class TwitchBot {
  public client: any;
  public botEE: EventEmitter;
  public commands: {[key: string]: ICommand} = {};
  public userGroups: [string] = ['*', '$', '@'];
  private whisperDelay: number = 2000;
  private unsavedChatLogs: IChatLog[] = [];
  // things to do when terminal exits.
  private TODO_ON_EXIT: [Function] = [() => console.log('\nEXITING')];

  constructor(private config: {[key: string]: any}) {
    this.botEE = new EventEmitter();
    this.client = new irc.client(this.config);

    Rx.Observable.fromEvent(this.botEE, $.IncChat, (obj: any) => obj)
      .do(input => this.gatherChatLog(input))
      .filter(input => this.isCommand(input.msg))
      .filter(input =>
        this.checkDebounce(TwitchBot.normalizeMessage(input.msg)))
      .filter(input => this.checkPermissions(input))
      .map(input => this.formatInput(input))
      .do(payload => this.doCommand(payload))
      .subscribe(() => console.log(`command`));

    Rx.Observable.fromEvent(this.botEE, $.IncWhisper, (obj: any) => obj)
      .do(input => console.log(input))
      .subscribe(() => console.log($.IncWhisper));

    Rx.Observable.fromEvent(this.botEE, $.OutWhisper, (obj: any) => obj)
      .map(output => Rx.Observable.of(output).delay(this.whisperDelay))
      .concatAll()
      .subscribe((o: any) => this.whisper(o.username, o.message));

    Rx.Observable.fromEvent(this.botEE, $.ChatLog, (obj: any) => obj)
      .do(data => this.unsavedChatLogs.push(data))
      .bufferCount(25)
      .do(data => TwitchBot.saveLog(data))
      .subscribe(() => console.log(`saving chat logs`));

    this.addExitFunction(async () => {
      TwitchBot.saveLog(this.unsavedChatLogs);
      // await this.say('...signing off.');
    });
  }

  public async doCommand(payload: IPayload): Promise<boolean> {
    try {
      const command: ICommand = this.commands[payload.command.substr(1)];
      await command.action.call(this, payload);
      command.lastExe = Date.now();
      return true;
    } catch (e) {
      TwitchBot.sysLog('error', 'Problem executing command doCommand()', '~', {
        payload,
        error: e,
      });
      return false;
    }
  }

  public addCommand(
    command: string | [string], action: Function, debounce: number = 0) {
    // If array, we want to apply that action to the array of commands
    if (Array.isArray(command)) {
      return command.map(cmd => this.addCommand(cmd, action, debounce));
    }
    // When adding a command, you can specify what 'kind' of command it is.
    // For example '*' means everyone can use this command,
    // '$' means only subscribers can use it.
    // and '@' is mod. These are identifiers.
    // identifier + string = command;
    if (this.userGroups.includes(command[0])) {
      const string = command.substr(1).toLowerCase();
      return this.commands[string] = {
        action,
        debounce,
        string,
        reqRights: this.userGroups.indexOf(command[0]),
        lastExe: 0,
      };

    } else {
      throw new Error(`command needs an identifier: ${this.userGroups}`);
    }

  }

  public async say(message: string) {
    await this.client.say(this.config.channels[0], message);
    return;
  }

  public async whisperQueue(username: string, message: string): Promise<void> {
    await this.botEE.emit($.OutWhisper, { username, message });
    return;
  }

  public async whisper(username: string, message: string): Promise<void> {
    try {
      await this.client.whisper(username, message);
    } catch (e) {
      TwitchBot.sysLog('warning', 'could not send whisper', '~', {
        username,
        message,
        error: e,
      });
    }
    return;
  }

  /**
   * @method connect
   * @description connect the twitch bot to irc channel.
   * @return {Promise<void>}
   */
  public async connect(): Promise<void> {
    await this.client.connect();

    this.client.addListener('chat', (
      ch: string, user: IUser, msg: string, self: boolean, action: any) =>
        this.botEE.emit($.IncChat, { ch, user, msg, self, action }));

    this.client.addListener('whisper', (
      ch: string, user: IUser, msg: string) =>
        this.botEE.emit($.IncWhisper, { ch, user, msg }));
  }

  /**
   * @method addExitFunction
   * @description adds item to safe exit array.
   * @return {number}
   */
  public addExitFunction(fun: Function): void {
    this.TODO_ON_EXIT.push(fun);
    return;
  }

  public getExitItems(): any {
    return this.TODO_ON_EXIT.filter(fun => typeof fun === 'function');
  }

  /**
   * @method formatInput
   * @description This command is mainly for easy access to what the user type
   *              inside of a command.
   * @param {IInput} input - Chat input.
   * @return {IPayload}
   */
  public formatInput(input: IInput): IPayload {
    const user = input.user;
    return {
      user,
      command: TwitchBot.normalizeMessage(input.msg),
      from: input.user.username,
      type: input.user['message-type'],
      start: Date.now(),
      args: this.getArgumentsFromMsg(input.msg),
    };
  }

  public checkDebounce(command: string): boolean {
    try {
      const string = command.substr(1);
      if (!this.commands[string].action) return false;
      const currentTime = Date.now();
      const debounce = this.commands[string].debounce || 0;
      const timePastSinceLastExe = currentTime - this.commands[string].lastExe;
      return timePastSinceLastExe > debounce;
    } catch (e) {
      console.log(`DEBOUNCE: could not execute command.`);
      return false;
    }

  }

  public checkPermissions(input: IInput): boolean {
    try {
      const string = TwitchBot.normalizeMessage(input.msg).substr(1);
      switch (this.commands[string].reqRights) {
        case UserType.Normal:     return true;
        case UserType.Subscriber: return input.user.subscriber === true;
        case UserType.Mod:        return input.user.mod === true ||
                                    this.isBroadcaster(input.user.username);
        default:                  return false;
      }
    } catch (e) {
      TwitchBot.sysLog('warning', `command did not pass checkPermissions`, '~',
        { input, error: e });
      return false;
    }

  }

  public isCommand(command: string): boolean {
    // See if input message begins with command character &&
    // See if input message is longer than command character.
    return command[0] === this.config.commandCharacter &&
           command.trim().length > this.config.commandCharacter.length;
  }

  /**
   * @method normalizeCommand
   * @description Used to trim and lowercase incoming messages
   *              before attempting to call them in list of commands.
   * @param {string} inputMsg - message that needs to be converted.
   * @return {string} - return command.
   */
  public static normalizeMessage(inputMsg: string): string {
    const msgArray = inputMsg.trim().split(' ');
    const msg = msgArray[0];
    return msg.toLowerCase();
  }

  /**
   * @method getArgumentsFromMsg
   * @description Used for formatting input message command arguments.
   * @param {string} inputMsg - message that needs to be converted.
   * @return {[string] | false} - args or false if no args are present.
   */
  public getArgumentsFromMsg(inputMsg: string): any[] {
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

  public static saveLog(data, type: string = 'chat') {
    if (type === 'chat') {
      return saveChatLog(data);
    }
  }

  public static sysLog(type: 'info' | 'warning' | 'error',
                message: string,
                plugin: '~' | 'betting'| 'bpm' | 'voting' | 'apply',
                data: any = false) {
    const log: ILog = { message, plugin, type, data };
    switch (type) {
      case 'error':
        console.error(log);
        break;
      case 'warning':
        console.warn(log);
        break;
      case 'info':
        console.info(log);
    }

    return saveSystemLog(log);
  }

  /**
   * @method selfCommand
   * @description Method for bot to tell itself to execute a command.
   * @param command - command string, example: !openBets.
   * @param args - command arguments.
   * @return <void>
   */
  public selfCommand(command: string, ...args) {
    const payload: IPayload = {
      args,
      command: command.toLowerCase(),
      user: {
        'display-name': this.config.identity.username,
        'message-type': 'self',
        mod: true,
        subscriber: true,
        turbo: false,
        username: this.config.identity.username,
      },
      type: 'self',
      start: Date.now(),
      from: 'self',
    };
    return this.doCommand(payload);
  }

  public static ms(
    duration: number, measurement: 'minutes' | 'seconds' = 'minutes',
  ) {
    return moment.duration(duration, measurement).asMilliseconds();
  }

  public isBroadcaster(username: string) : boolean {
    const ch = this.config.channels[0].substr(1).toLowerCase();
    return ch === username.toLowerCase();
  }

  /**
   * @method thousands
   * @description Turns number into string with commas as thousands separators.
   */
  public static thousands(number: number): string {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  private gatherChatLog(input) {
    const log: IChatLog = {
      timestamp: Date.now(),
      message: input.msg,
      user: input.user,
    };
    return this.botEE.emit($.ChatLog, log);
  }
}
