const irc = require('tmi.js');

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

export class TwitchBot {
  public client: any;

  constructor(private config: {[key: string]: any}) {
    this.client = new irc.client(this.config);
  }

  public async say(message: string) {
    console.log(`this.config.channels[0]`);
    console.log(this.config.channels[0]);
    await this.client.say(this.config.channels[0], message);
    return;
  }

  /**
   * @method connect
   * @description connect the twitch bot to irc channel.
   * @return {Promise<void>}
   */
  public async connect(): Promise<void> {
    console.log(`run`);
    await this.client.connect();
    this.client.addListener('chat', (
      ch: string, user: IUser, msg: string, self: string, action: any) => {
      console.log(`
      user: ${user['display-name']}
      channel: ${ch}
      msg: ${msg}
      self: ${self}
      actions: ${action}
      `);

    });

    return;
  }
}
