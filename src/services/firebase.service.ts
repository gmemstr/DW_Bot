import * as firebase from 'firebase-admin';
import environment from '../environment';
import * as _ from 'lodash';

const credential = firebase.credential
  .cert(environment.firebase.serviceAccount);
const databaseURL = environment.firebase.databaseURL;

export interface IFirebaseFrame {
  betting?: { blue?: number, highestBetter?: string, red?: number };
  countdown?: boolean;
  currentGameId?: number;
  game?: any;
  lastUpdate?: number;
  liveVoting?: {
    votingOn?: 'design' | 'func' | 'tiebreaker',
    design?: { red?: number, blue?: number },
    func?: { red?: number, blue?: number },
    tiebreaker?: { red?: number, blue?: number },
  };
  stage?: 'objective' | 'betting' | 'voting';
  timer?: number;
}

firebase.initializeApp({
  credential,
  databaseURL,
});

export const frame = firebase.database().ref('frame');

export function resetFrame() {
  frame.update({
    lastUpdated: false,
    currentGameId: 0,
    timer: false,
    stage: 'objective',
    game: false,

    liveVoting: {

      votingOn: 'design',

      design: {
        red: 0,
        blue: 0,
      },
      func: {
        red: 0,
        blue: 0,
      },
      tiebreaker: {
        red: 0,
        blue: 0,
      },
    },

    betting: {
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

export function switchStage(stage: 'objective' | 'betting' | 'voting') {
  return frame.child('stage').set(stage);
}

