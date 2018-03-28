export interface IUser {
  badges?: { [key: string]: string; };
  color?: any;
  'display-name': string;
  emotes?: any;
  id?: string;
  mod: boolean;
  'room-id'?: string;
  'sent-ts'?: string;
  subscriber: boolean;
  'tmi-sent-ts'?: string;
  turbo: boolean;
  'user-type'?: string;
  username: string;
  'message-type': 'chat' | 'whisper' | 'self';
}

// input coming from user in chat.
export interface IInput {
  ch: string;
  user: IUser;
  msg: string;
  self: boolean;
  action: any;
}

// input after it's gone though formatInput method.
export interface IPayload {
  // if user types !bet blue 100
  // args: ['blue', '100']
  args: any[];
  user: IUser;
  from: string;
  command: string;
  type: IUser['message-type'];
  start: number;
}

export interface ICommand {
  string: string;
  action: Function;
  lastExe?: number;
  reqRights?: any;
  debounce?: number;
}


// export interface DatabaseInterface {
//   channels: [IChannel];
//   startTimestamp: number;
// }

// export interface IChannel {
//   name: string;
//   chatLogs: [IChatLog];
//   infoLogs: [ILog];
// }

export interface IChatLog {
  timestamp: number;
  message: string;
  user: IUser;
  whisper?: boolean;
}

export interface ILog {
  message: string;
  plugin: '~' | 'betting'| 'bpm' | 'voting' | 'apply';
  type: 'info' | 'warning' | 'error';
  data?: any;
}

// DISCORD INTERFACES
export interface user {

}

export interface DUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  bot: boolean;
  lastMessageID: string;
  lastMessage: any;
}
