import {error} from 'util';
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

  botEE = new EventEmitter();

  constructor(config = {}) {
    this._config = config;
    this.client = new irc.client(config);

    // Incoming chat stream.
    this.botEE.on('incChat$', (input) => {
      input
        // See if input message begins with command character.
        .filter(input => input.message[0] === this._config.commandCharacter)
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
          let output = {from: input.user.username, text: input.message, inputCommand: inputCommand, rest: null, args: null, start: new Date().getTime(), end: -1};
          output.rest = input.message.slice(inputCommand.length + 1).trim();
          output.args = output.rest.split(/\s+/g).map(function (x) {
            var t = +x;
            return isNaN(t) ? x : t
          });
          
          console.log('good command');
          console.log('output: ', output);

          return this.doCommand(output.inputCommand, this.commands[output.inputCommand].response, output);
        })

    })
  }

  receiveWhisper(from: String, message: String) {
    //See if whisper message is a command. Disabled for now.
    //this.botEE.emit('incChat$', [{user: from, message: message}]);
  }

  whisper(user: String, message: String, cb: Function = () => {}) {
    if (!user || !message) return;
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
    return cb();
  }

  //static connectWhisper(config) {
  //  new irc.client(config);
  //}

  get Mods() {
    return this.client.mods(this._config.channels[0]);
  }

  isMod(name:String, cb:Function) {
    if (name === this._config.channels[0].slice(1)) return cb(true);
    this.Mods.then((res) => {
      if (res.indexOf(name) !== -1) {
        return cb(true);
      }
      return cb(false);
    });

  }

  addCommand(command:String, response:Function) {
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

  selfCommand(text:String, ...params) { //this only used for the bot to tell itself to do a command.
    return this.botEE.emit('incChat$', [{user: this._config.user, message: text}]);
    // return this.tryCommand(this._config.identity.username, text, params);
  }

  get config() {
    return this._config;
  }

  set config(newConfig) {
    this._config = newConfig
  }

  run() {
    this.client.connect();
    // this.client.addListener('chat', this.chat.bind(this));
    this.client.addListener('chat', (channel, user, message, self, action) => {
      this.botEE.emit('incChat$', [{user: user, message: message}]);
    });

    this.client.addListener('whisper', this.receiveWhisper.bind(this));
  }
}

