import axios from 'axios';
import environment from '../environment';

const url = environment.dwServer.url;
const key = environment.dwServer.key;

export async function getDevBits(username: string): Promise<number> {
  const req = await axios(`${url}/v1/devbits/${username}`);
  return Number(req.data);
}
