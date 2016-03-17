var ref = null;

export enum Stages { objective, betting, voting }



export default function(firebase, authData) {
  console.log("Firebase Starting data:", authData);
  ref = firebase;
}


export function test() {
  ref.once('value', snap => console.log('snap ', snap))
}

export function changeStage(stage: Stages, cb: Function = () => {}) {
  const newStage = Stages[stage];
  ref.child('frame').child('stage').set(newStage);
}
