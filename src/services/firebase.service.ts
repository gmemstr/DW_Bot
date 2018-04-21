import * as firebase from 'firebase-admin';
import environment from '../environment';
import * as _ from 'lodash';
import { IChatLog, ILog } from '../interfaces';

const credential = firebase.credential
  .cert(environment.firebase.serviceAccount);
const databaseURL = environment.firebase.databaseURL;

export type stages = 'objective' | 'betting' | 'voting' | 'poll';
export type voteCategories = 'ui' | 'ux' | 'tiebreaker';
export type teamColors = 'red' | 'blue';

export interface IFirebaseFrame {
  betting?: {
    blue?: number,
    highestBetter?: string,
    red?: number,
    betters?: [any],
    timestamp?: number,
  };
  countdown?: boolean;
  currentGameId?: number;
  game?: any;
  lastUpdate?: number;
  liveVoting?: {
    votingOn?: voteCategories,
    design?: { red?: number, blue?: number },
    func?: { red?: number, blue?: number },
    tiebreaker?: { red?: number, blue?: number },
  };
  poll?: {
    question?: string,
    options?: {text?: string, votes?: number},
    timer?: number,
  };
  stage?: stages;
  timer?: number;
}

firebase.initializeApp({
  credential,
  databaseURL,
});

export const frame = firebase.database().ref('frame');
export const editor = firebase.database().ref('liveGame');
export const env = firebase.database().ref(environment.env);

export function resetFrame() {
  frame.update({
    lastUpdated: firebase.database.ServerValue.TIMESTAMP,
    bpm: 20,
    timer: false,
    stage: 'objective',
    game: false,

    liveVoting: {

      votingOn: 'ui',

      ui: {
        red: 0,
        blue: 0,
      },
      ux: {
        red: 0,
        blue: 0,
      },
      tiebreaker: {
        red: 0,
        blue: 0,
      },
    },

    betting: {
      betters: [],
      red: 0,
      blue: 0,
      highestBetter: false,
    },
  });
}

export function updateFrame(updates: IFirebaseFrame) {
  return new Promise((resolve, reject) => {
    frame.once('value', (snap) => {
      frame.update(_.merge(snap.val(), updates))
        .then(() => resolve())
        .catch(err => reject(err));
    });
  });
}

export async function switchStage(stage: stages) {
  await frame.child('stage').set(stage);
  return;
}

export async function updateBettingTimestamp() {
  const timestamp = Date.now();
  await frame.child('betting').child('timestamp')
    .set(timestamp);
  return;
}

export async function updateVotingTimestamp() {
  const timestamp = Date.now();
  await frame.child('liveVoting').child('timestamp')
    .set(timestamp);
  return;
}

export async function addVoteOnFrame(
  color: teamColors, category: voteCategories) {
  await frame.child('liveVoting').child(category).child(color)
    .transaction(currentNum => currentNum + 1);
  return;
}

export async function addTime(ms: number) {
  await frame.child('timer').transaction((current: number) => current + ms);
  return;
}

export async function startTimer() {
  await frame.child('timer').set(firebase.database.ServerValue.TIMESTAMP);
  return;
}

export function addFrameBet(name: string, amount: number, team: string) {
  frame.child('betting').child('betters').push({
    name, team, amount, timestamp: firebase.database.ServerValue.TIMESTAMP,
  });
  return;
}

export async function removeFrameBet(username: string) {
  return await frame.child('betting').child('betters')
    .once('value', async (snap:any) => {
      const betters = snap.val();
      const key = _.findKey(betters, better => better.name === username);
      return await frame.child('betting').child('betters').child(key).remove();
    });
}

export async function emptyFrameBetters() {
  return await frame.child('betting').child('betters').remove();
}

export async function getFrameBetters() {
  const snap = await frame.child('betting').child('betters').once('value');
  return snap.val();
}

export function saveChatLog(logs: [IChatLog]) {
  return env.child('chatLogs').push({
    data: logs,
    timestamp: firebase.database.ServerValue.TIMESTAMP,
  });
}

export function saveSystemLog(log: ILog) {
  log.data = JSON.stringify(log.data);
  return env.child('systemLogs').push({
    data: log,
    timestamp: firebase.database.ServerValue.TIMESTAMP,
  });
}

export async function switchVote(category: string) {
  await frame.child('liveVoting').child('votingOn').set(category);
  return;
}

export function listenForStageChange(cb: Function) {
  return editor
    .child('state')
    .child('stage')
    .on('value', snap => cb(snap.val()));
}

export async function getLogData(locationKey: string) {
  const snap = await env.child(`systemLogs`).child(locationKey).once('value');
  return snap.val();
}

export function saveAnalytics(viewers) {
  return env.child('analytics').push({
    viewers,
    env: environment.env,
    timestamp: firebase.database.ServerValue.TIMESTAMP,
  });
}

export async function getBPMValue() {
  const snap = await frame.child('bpm').once('value');
  return Number(snap.val());
}


export async function setPoll(question, options: Object) {
  const timer = Date.now();
  await frame.child('poll').set({
    question,
    options,
    timer,
  });
}


export async function addPollVote(optionLocation, votes: number = 1) {
  await frame.child('poll').child(optionLocation).child('votes')
    .transaction(curr => curr + votes);
  return;
}
