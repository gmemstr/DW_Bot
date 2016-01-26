import * as request from 'request';
import config from '../../config/environment';
import {create as createTest} from '../../api/test/test.controller.ts';
import Test from '../../api/test/test.model.ts';
import * as gameService from '../../services/game.service'

export default function (bot) {
  bot.addCommand('*bet', function () {
    bot.say('we got your bet.');
  });

  bot.addCommand('@modbet', function () {
    bot.say('we got your MOD bet');
  });

  bot.addCommand('@test', function () {
    gameService.getCurrentGame((gameInfo, err) => {

    })
  });
}
