import * as request from 'request';
import config from '../config/environment';

const channel = config.bot.channels[0];

export function getStreamData(cb: Function) {
  request.get(`http://api.twitch/kraken/streams/${channel}`, (error, res, body) => {
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

