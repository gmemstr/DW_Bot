import axios from 'axios';
import environment from '../environment';

const url = environment.dwServer.url;
const key = environment.dwServer.key;

export async function getBits(user: string): Promise<number> {
  const req = await axios(`${url}/v1/devbits/${user}`);
  return Number(req.data);
}

export async function putBits(user: string, amount: number): Promise<void> {
  try {
    await axios.put(`${url}/v1/devbits/${user}/${amount}/?key=${key}`);
    return;
  } catch (e) { console.log(e); }
}

export async function hasBits(user: string, amount: number): Promise<boolean> {
  const dbAmount = await getBits(user);
  return dbAmount > amount;
}
