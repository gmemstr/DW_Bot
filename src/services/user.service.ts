import axios from 'axios';
import environment from '../environment';

const url = environment.dwServer.url;
const key = environment.dwServer.key;

export async function getBits(name: string, id: any): Promise<number> {
  const req = await axios.get(`${url}/bot/bits`, {
    params: {
      id,
      username: name,
    },
  });
  return Number(req.data);
}

export async function putBits(name: string, amount: number, id: any) {
  try {
    await axios.post(`${url}/bot/bits`, {}, {
      params: {
        id,
        key,
        amount,
        username: name,
      },
    });
    return;
  } catch (e) {
    console.log(e);
  }
}

export async function hasBits(name: string, amount: number, id: any) {
  const dbAmount = await getBits(name, id);
  return dbAmount >= amount;
}

export async function bitsLeaderboard(): Promise<any> {
  try {
    const { data } = await axios.get(`${url}/leaderboard/bits`);
    return data;
  } catch (e) {
    throw e;
  }
}


export async function xpLeaderboard(): Promise<any> {
  try {
    const { data } = await axios.get(`${url}/leaderboard/xp`);
    return data;
  } catch (e) {
    throw e;
  }
}
