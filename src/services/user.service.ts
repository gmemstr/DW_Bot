import axios from 'axios';
import environment from '../environment';

const url = environment.dwServer.url;
const key = environment.dwServer.key;

export async function getBits(name: string): Promise<number> {
  const req = await axios(`${url}/v1/devbits/${name}`);
  return Number(req.data);
}

export async function putBits(name: string, amount: number): Promise<void> {
  try {
    await axios.put(`${url}/v1/devbits/${name}/${amount}/?key=${key}`);
    return;
  } catch (e) { console.log(e); }
}

export async function hasBits(name: string, amount: number): Promise<boolean> {
  const dbAmount = await getBits(name);
  return dbAmount > amount;
}
