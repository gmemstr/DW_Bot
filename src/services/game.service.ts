import axios from 'axios';
import { IGame } from './service.interfaces';
import environment from '../environment';
import { voteCategories } from './firebase.service';

const url = environment.dwServer.url;
const key: string = environment.dwServer.key;


export async function currentGame(): Promise<IGame> {
  const { data } = await axios.get(`${url}/v1/game/currentgame`);
  return data;
}

// Example Request:
// /v1/game/{game_id}/team/{team_id}/addvotes?design=20&func=20&code=20
export async function sendVotes(gameId: number,
                      teamId: any, category: voteCategories, votes: number) {
  try {
    const u = `${url}/v1/game`;
    await axios.post(`${u}/${gameId}/team/${teamId}/addVotes`, {
      key,
      [category]: votes,
    });
    return;
  } catch (e) {
    throw e;
  }

}

export async function signUp(twitchUsername: string, gameId: number) {
  try {
    return await axios.post(`${url}/v1/${gameId}/signuptwitchuser`, {
      key,
      username: twitchUsername,
    });
  } catch (e) {
    throw Error(e);
  }
}


export async function endGame(gameId: number, teamId: number) {
  try {
    return await axios.post(`${url}/v1/${gameId}/endgame`, {
      key,
      winner: teamId,
    });
  } catch (e) {
    throw Error(e);
  }
}
