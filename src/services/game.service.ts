import axios from 'axios';
import { IGame } from './service.interfaces';
import environment from '../environment';
import { voteCategories } from './firebase.service';

const url = environment.dwServer.url;
const key: string = environment.dwServer.key;

// TODO:
const errHandler = (error: any) => {};

export async function currentGame(): Promise<IGame> {
  try {
    const req = await axios(`${url}/v1/game/currentgame?key=${key}`);
    return JSON.parse(req.data);
  } catch (e) {
    throw e;
  }
}

// Example Request:
// /v1/game/{game_id}/team/{team_id}/addvotes?design=20&func=20&code=20
export async function sendVotes(gameId: number,
                      teamId: any, category: voteCategories, votes: number) {
  try {
    const u = `${url}/v1/game`;
    const r = await axios.post(`${u}/${gameId}/team/${teamId}/addVotes`, {
      key,
      [category]: votes,
    });
    return JSON.parse(r.data);
  } catch (e) {
    // TODO: errHandler.
  }

}
