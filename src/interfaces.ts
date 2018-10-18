import {
  Message, User, TextChannel, DMChannel, GroupDMChannel,
  GuildMember,
} from 'discord.js';

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
  reply: Function;
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
  plugin: '~' | 'betting'| 'bpm' | 'voting' | 'apply' | 'poll';
  type: 'info' | 'warning' | 'error';
  data?: any;
}

// DISCORD INTERFACES
export interface DPayload {
  ch: string;
  channel: TextChannel | DMChannel | GroupDMChannel;
  user: User;
  member: GuildMember;
  args: any[];
  start: number;
  command: string;
  reply: Function;
}

// user object from DevWars servers
export interface DWUser {
  id: number;
  ranking: {
    rank: DWRank;
    next_rank: DWRank;
    bits: number;
    xp: number;
  };
  players: any;
  avatar_url: string;
  information: {
    url: string;
    about: string;
    for_hire: boolean;
  };
}


interface DWRank {
  bits: number;
  id: number;
  level: number;
  rank_level: number;
  xp_required: number;
  rank: string;
  level_name: string;
}
