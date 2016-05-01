import {error} from 'util';
import * as Rx from 'rxjs/Rx';
import {EventEmitter} from 'events';
const irc = require('tmi.js');

enum UserType {
  Normal,
  Subscriber,
  Mod
}

export class Bot {
  client:any;
  _config:any;
  commands:Object = {};
  userGroups:String[] = ['*', '$', '@'];
  whisperArray:any = [];
  whisperCycle:Boolean = false;

  emitter = new EventEmitter();

  incChat$ = undefined;
  outWhisper$ = undefined;

  constructor (config = {}) {
    this._config = config;
    this.client = new irc.client(config);
  }

  run() {
    this.client.connect();
    this.client.addListener('whisper', this.receiveWhisper.bind(this));

    this.incChat$ = Rx.Observable.fromEvent(
      this.client,
      'chat',
      (channel, user, message, self) => ({channel: channel, user: user, message: message, self: self})
    );

    this.outWhisper$ = Rx.Observable.fromEvent(
      this.emitter,
      'outWhisper$'
    );

  }



  _incChat$() {


    this.incChat$
      // See if input message begins with command character.
      .filter(input => input.message[0] === this._config.commandCharacter)
      .do(x => console.log(x))
      // See if input message is longer than command character.
      .filter(input => input.message.length > this._config.commandCharacter.length)
      // See if first word in input message is valid command.
      .filter(input => {
        if (this.commands[input.message.slice(this._config.commandCharacter.length).split(/\s+/g)[0].toLowerCase()]) return true
      })
      // See if User is allowed to execute command.
      .filter(input => {
        let inputCommand = input.message.slice(this._config.commandCharacter.length).split(/\s+/g)[0].toLowerCase();
        switch (this.commands[inputCommand].rights) {
          case UserType.Normal: return true;
          case UserType.Subscriber: return input.user.subscriber === true;
          case UserType.Mod: return input.user.mod === true;
          default: return false;
        }
      })
      // Format needed information before sending it off to doCommand function.
      .map(input => {
        let inputCommand = input.message.slice(this._config.commandCharacter.length).split(/\s+/g)[0].toLowerCase();
        let output = {from: input.user.username, text: input.message, inputCommand: inputCommand, rest: null, args: null, start: new Date().getTime(), end: -1}
        output.rest = input.message.slice(inputCommand.length + 1).trim();
        output.args = output.rest.split(/\s+/g).map(function (x) {
          var t = +x;
          return isNaN(t) ? x : t
        });

        return output;
      })
      .subscribe( output => {
        console.log("good command");
        this.doCommand(output.inputCommand, this.commands[output.inputCommand].response, output)
      });
  }

  receiveWhisper(from: String, message: String) {
    if (message[0] === this._config.commandCharacter) {
      //
      // this.tryCommand(from, message)
    }
  }

  whisper(user: String, message: String, cb: Function = () => {}) {
    console.log("emit");
    this.emitter.emit('outWhisper$', {user: user, message: message});

    // if (!user || !message) return;
    // this.client.say(this._config.channels[0], `/w ${user} ${message}`);
  }

  _outWhisper$() {

    const inc = (x) => this.sendWhisper(x.user, x.message);

    this.outWhisper$
      .delay(this.outWhisper$.Rx.Sceduler.queue)
      .forEach(x => setInterval(() => console.log('something ', x), 1600));

    // this.outWhisper$
    //   .buffer(this.outWhisper$.delay(1000))
    //   .subscribe(x => console.log('x ', x));
    // this.outWhisper$
    //   .forEach(
    //     x => setTimeout(() => console.log('x ', x), 1600),
    //     err => console.log('err ', err),
    //     complete => console.log('complete ', complete)
    //   );

      // .subscribe(x => this.client.say(this._config.channels[0], `/w ${x.user} ${x.message}`));

    // this.outWhisper$
    //   .flatMap(i => {
    //     return Rx.Observable
    //       .interval(1000)
    //
    //   })
    //   .subscribe( x => {
    //     this.client.say(this._config.channels[0], `/w ${x.user} ${x.message}`)
    //   })
  }

  sendWhisper(user: string, message: string) {
    this.client.say(this._config.channels[0], `/w ${user} ${message}`);
  }

  whisperQ(user: String, message: String) {



    this.whisperArray.push({user: user, message: message});
    if (!this.whisperCycle) this.sendWhisperQ();
  }

  sendWhisperQ() { // send first whisper.

    this.whisperCycle = true;
    let w = this.whisperArray[0];

    if (w) this.whisper(w.user, w.message);

    if (this.whisperArray.length > 0) {
      this.whisperArray.shift();
      setTimeout(() => this.sendWhisperQ(), 1600);
    } else {
      this.whisperCycle = false;
    }
  }



  say(text: String, cb: Function = () => {}) {
    this.client.say(this._config.channels[0], text);
    return cb(true);
  }

  addCommand(command:String, response:Function) {
    console.log("add command");
    if (typeof command === 'string') {
      if (command[0] === '*' || command[0] === '$' || command[0] === '@') {
        this.commands[command.slice(1).toLowerCase()] = {
          command: command.slice(1).toLowerCase(),
          response: response,
          rights: this.userGroups.indexOf(command[0])
        }
      }
      else throw error('command does not have an Identifier. *, $, or @!');
    }
  }

  doCommand(command:String, response:Function, o:Object) {
    if (typeof command === 'string' && typeof response === 'function') {
      response.call(this, o);
    }
  }

  // selfCommand(text:String, ...params) { //this only used for the bot to tell itself to do a command.
  //   return this.tryCommand(this._config.identity.username, text, params);
  // }

  get config() {
    return this._config;
  }

  set config(newConfig) {
    this._config = newConfig
  }
}

