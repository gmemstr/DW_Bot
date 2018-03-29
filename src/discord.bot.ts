import { EventEmitter } from 'events';
import * as Rx from '@reactivex/rxjs';
import { ICommand } from './interfaces';
const discord = require('discord.js');


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
      .filter(input => this.isCommand(input.content))
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
    // See if input message begins with command character &&
    // See if input message is longer than command character.
    return command[0] === this.config.commandCharacter &&
      command.trim().length > this.config.commandCharacter.length;
  }

  public async connect(): Promise<void> {
    await this.client.login(this.config.token);

    this.client.on('message', (message) => {
      this.botEE.emit(this.$.IncChat, message);
    });
    return;
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

}
