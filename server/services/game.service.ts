import * as request from 'request';
import config from '../config/environment';

const botUrl = `http://${config.ip}:${config.port}`;

const url = config.dwServer.url;
const key = config.dwServer.key;


export function getCurrentGame(cb: Function) {
  request(`${url}/v1/game/currentgame?key=${key}`, (err, res, body) => {

    if (!err && res.statusCode === 200) return cb(JSON.parse(body));
    else return cb(false, body);

  })
}

export function getCurrentGameId(cb: Function = () => {}) {
  getCurrentGame((game) => {
    return cb(game.id);
  });
}

export function earnedBets(winnings: Array<Object>) {
  request.post(`${url}/v1/devbits/earnedbets?key=${key}`)
    .form({bets: JSON.stringify(winnings)});
}

export function postVotes(category: string, count: number, gameId: number, teamId: number, cb?: Function) {
  request(`${url}/v1/game/${gameId}/team/${teamId}/addVotes?key=${key}&${category}=${count}`,
    (err, res, body) => !err && res.statusCode === 200 ? cb(true) : cb(false) )
}

export function api(boo: boolean) {
  // console.log('config ', config);
  request.post(`${botUrl}/api/test`)
    .form({name: 'test', info: true, active: false, some: 'thing'})
    .on('response', res => console.log('res ', res));
}
