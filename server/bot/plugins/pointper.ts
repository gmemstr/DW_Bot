import * as userService from '../../services/user.service';
import * as gameService from '../../services/game.service';
import * as twitchService from '../../services/twitch.service';
import * as moment from 'moment';

export default function (bot) {
  function sendPoints() {
    twitchService.getChatters(chat => {
      let viewers = chat.chatters.viewers;
      let count = chat.chatter_count;

    })
  }
}
