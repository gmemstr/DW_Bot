import * as request from 'request';
import config from '../config/environment';

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

export function earnedBets(winnings: Array<Object>) {
  request.post(`${url}/v1/devbits/earnedbets?key=${key}`)
    .form({bets: JSON.stringify(winnings)});
}
