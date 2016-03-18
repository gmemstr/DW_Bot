var ref = null;

export enum Stages { objective, betting, voting }

export enum VoteCategories { design, func, tiebreaker }

interface FirebaseFrame {
  betting?: {blue?: number, highestBetter?: string, red?: number};
  countdown?: boolean,
  currentGameId?: number,
  game?: any,
  lastUpdate?: number,
  liveVoting?: {votingOn?: string},
  stage?: string,
  timer?: number
}

export default function(firebase, authData) {
  console.log("Firebase Starting data:", authData);
  ref = firebase;
}


export function test() {
  ref.once('value', snap => console.log('snap ', snap))
}

export function changeStage(stage: Stages, cb: Function = () => {}) {
  const newStage = Stages[stage];
  ref.child('stage').set(newStage);
}

export function addVote(color: string, category: VoteCategories, count: number = 1, cb: Function = () => {}) {
  const cat = VoteCategories[category];
  ref.child('liveVoting').child(cat).child(color).transaction(currentNum => currentNum + count)
}

export function changeVoteCat(category: VoteCategories, title?: string, cb: Function = () => {}) {
  const cat = VoteCategories[category];
  const voteRef = ref.child('liveVoting').child('votingOn');
  title ? voteRef.set(`${cat}:${title}`) : voteRef.set(cat);
}


export function updateGame(gameData) {
  //if no game data is provided it will reset the values.
  ref.child('frame').update({
    lastUpdated: Firebase.ServerValue.TIMESTAMP,
    currentGameId: gameData.id,
    timer: Firebase.ServerValue.TIMESTAMP,
    stage: 'objective',
    game: gameData,

    liveVoting: {

      votingOn: false,

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




