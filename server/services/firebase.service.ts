var ref = null;
export default function(firebase, authData) {
  console.log("Firebase Starting data:", authData);
  ref = firebase;
}



export function test() {
  ref.once('value', snap => console.log('snap ', snap))
}

export function getDb(cb: Function) {

}
