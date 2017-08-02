import environment from '../environment';
import axios from 'axios';

const request = axios.create({
  baseURL: 'https://api.twitch.tv/kraken',
  timeout: 1000,
  headers: {
    'Client-ID': environment.bot.identity.password,
  },
});

const ch = environment.bot.channels[0];

// DOCS: https://dev.twitch.tv/docs/v5/reference/streams/
export interface IStream {
  _id: number;
  game: string;
  viewers: number;
  video_height: number;
  average_fps: number;
  delay: number;
  create_at: string; // 2017-08-02T00:08:03Z
  is_playlist: boolean;
  stream_type: string;
  preview: object;
  channel: IChannel;
}

export interface IChannel {
  mature: boolean;
  partner: boolean;
  status: string;
  broadcaster_language: string;
  display_name: string;
  game: string;
  language: string;
  _id: number;
  name: string;
  created_at: string;
  updated_at: string;
  delay: number;
  logo: string;
  banner: string;
  video_banner: string;
  url: string;
  views: number;
  followers: number;
}

export async function getStreamInfo(channel: string = ch): Promise<IStream> {
  const stream =
    await request.get(`/streams/${channel}`);
  return stream.data;
}
