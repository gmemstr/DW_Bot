import { EventEmitter } from 'events';
import * as Rx from '@reactivex/rxjs';
import { error } from 'util';
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
};

export interface IUser {
  badges?: { [key: string]: string; };
  color: any;
  'display-name': string;
  emotes: any;
  id: string;
  mod: boolean;
  'room-id': string;
  'sent-ts': string;
  subscriber: boolean;
  'tmi-sent-ts': string;
  turbo: boolean;
  'user-type': string;
  username: string;
  'message-type': 'chat' | 'whisper';
}

export interface ICommand {
  string: string;
  action: Function;
  lastExe?: number;
  debounce?: number;
}

export class TwitchBot {
  public client: any;
  public botEE: EventEmitter;
  public commands: Object = {};
  public userGroups: [string] = ['*', '$', '@'];

  constructor(private config: {[key: string]: any}) {
    this.botEE = new EventEmitter();
    this.client = new irc.client(this.config);

    Rx.Observable.fromEvent(this.botEE, $.IncChat, (obj: any) => obj)
      .do((e: string) => console.log(e))
      .filter(input => this.isCommand(input.msg))
      .subscribe((a: any) => console.log(`subscribe: ${a}`));
  }

  public async addCommand(string: string, action: Function, debounce?: number) {
    console.log(`add command`);
    // When adding a command, you can specify what 'kind' of command it is.
    // For example '*' means everyone can use this command,
    // '$' means only subscribers can use it.
    // and '@' is mod only.
    if (this.userGroups.includes(string[0])) {

    } else {
      throw error(`command does not have an identifier: ${this.userGroups}`);
    }

  }

  public async say(message: string) {
    await this.client.say(this.config.channels[0], message);
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
      ch: string, user: IUser, msg: string, self: boolean, action: any) => {
      console.log(`
      user: ${user['display-name']}
      channel: ${ch}
      msg: ${msg}
      self: ${self}
      actions: ${action}
      `);
      this.botEE.emit($.IncChat, { ch, user, msg, self, action });

    });
  }

  public isCommand(message: string): boolean {
    // See if input message begins with command character &&
    // See if input message is longer than command character.
    return message[0] === this.config.commandCharacter &&
           message.trim().length > this.config.commandCharacter.length;
  }
}
