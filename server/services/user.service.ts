import * as request from 'request';
import config from '../config/environment';

const url = config.dwServer.url;
const key = config.dwServer.key;


export function putDevbits (user: String, amount: Number, cb: Function = () => {}) {
  request.put(`${url}/v1/devbits/${user}/${amount}/?key=${key}`, (err, res, body) => {
    if (!err && res.statusCode === 200) return cb(true);
    else return cb(false);
  })
}

export function getDevbits (user: String, cb: Function = () => {}) {
  request(`${url}/v1/devbits/${user}/?key=${key}`, (err, res, body) => {
    if (!err && res.statusCode === 200) return cb(parseInt(body));
    else return cb(false);
  })
}


export function hasDevbits (user: String, request: Number, cb: Function = () => {}) {
  getDevbits(user, dbAmount => {
    if (dbAmount < request) return cb(false);
    else if (dbAmount >= request) return cb(true);
  })
}
