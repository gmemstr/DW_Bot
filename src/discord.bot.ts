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

}
