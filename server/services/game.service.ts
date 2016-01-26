import * as request from 'request';
import config from '../config/environment';
import * as promise from 'bluebird';


const url = config.dwServer.url;
const key = config.dwServer.key;


export function getCurrentGame(cb: Function) {
  request(`${url}/v1/game/currentgame?key=${key}`, (err, res, body) => {

    if (!err && res.statusCode === 200) return cb(JSON.parse(body));
    else return cb(false, body);

  })
}

export function getCurrentGameId() {
  getCurrentGame((game) => {
    return game.id;
  });
}
