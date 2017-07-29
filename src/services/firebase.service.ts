import * as firebase from 'firebase-admin';
import environment from '../environment';

const credential = environment.firebase.serviceAccount;
const databaseURL = environment.firebase.databaseURL;

firebase.initializeApp({
  credential,
  databaseURL,
});
