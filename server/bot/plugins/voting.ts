import * as firebaseService from '../../services/firebase.service';

export default function (bot) {
  bot.addCommand('@firebase', function(o) {
    firebaseService.test();
  })
}

