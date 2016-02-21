import * as request from 'request';
import config from '../config/environment';

const channel = config.bot.channels[0];

export function getStreamData(cb: Function) {
  request.get(`http://api.twitch.tv/kraken/streams/${channel}`, (error, res, body) => {
    if (!error && res.statusCode === 200) {
      return cb(JSON.parse(body));
    }
  })
}

export function getStreamStatus(cb: Function) {
  getStreamData(data => {
    return data.stream ? cb(true) : cb(false);
  })
}

export function getChatData(cb: Function) {
  request.get(`http://tmi.twitch.tv/group/user/${channel}/chatters`, (error, res, body) => {
    return !error && res.statusCode === 200 ? cb(JSON.parse(body)) : cb(false);
  })
}
