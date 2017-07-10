import axios from 'axios';
import { IGame } from './service.interfaces';
import environment from '../environment';

const url = environment.dwServer.url;
const key = environment.dwServer.key;

// TODO:
const errHandler = (error: any) => {};

export async function currentGame() {
  try {
    const req = await axios(`${url}/v1/game/currentgame?key=${key}`);
    return JSON.parse(req.data);
  } catch (e) {

  }
}
