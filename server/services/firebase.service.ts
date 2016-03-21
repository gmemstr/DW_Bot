import * as _ from 'lodash';
var ref = null;


export enum VoteCategories { design, func, tiebreaker }

interface FirebaseFrame {
  betting?: {blue?: number, highestBetter?: string, red?: number};
  countdown?: boolean,
  currentGameId?: number,
  game?: any,
  lastUpdate?: number,
  liveVoting?: {votingOn?: 'design' | 'func' | 'tiebreaker',
    design?: {red?: number, blue?: number},
    func?: {red?: number, blue?: number},
    tiebreaker?: {red?: number, blue?: number},
  },
  stage?: 'objective' | 'betting' | 'voting',
  timer?: number
}

export default function(firebase, authData) {
  console.log("Firebase Starting data:", authData);
  ref = firebase;
}


export function addVoteOnFrame(color: string, category: VoteCategories, count: number = 1, cb: Function = () => {}) {
  ref.child('liveVoting').child(category).child(color).transaction(currentNum => currentNum + count)
}



export function resetFrame() {
  ref.update({
    lastUpdated: Firebase.ServerValue.TIMESTAMP,
    currentGameId: 0,
    timer: Firebase.ServerValue.TIMESTAMP,
    stage: 'objective',
    game: false,

    liveVoting: {

      votingOn: 'design',

      design: {
        red: 0,
        blue: 0
      },
      func: {
        red: 0,
        blue: 0
      },
      tiebreaker: {
        red: 0,
        blue: 0
      }
    },

    betting: {
      red: 0,
      blue: 0,
      highestBetter: false
    }
  });
}


export function updateFrame(newData: FirebaseFrame, cb: Function = () => {}) {
  ref.once('value', dataSnap => {
    ref.update(_.merge(dataSnap.val(), newData));
    cb(true);
  }, err => console.log('err ', err));
}




