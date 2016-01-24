import * as request from 'request';
import config from '../../../config/environment';
import {create as createTest} from '../../../api/test/test.controller';
import Test from '../../../api/test/test.model';

export default function(bot) {
    bot.addCommand('*bet', function () {
        bot.say('we got your bet.');
    });

    bot.addCommand('@modbet', function () {
        bot.say('we got your MOD bet');
    });

    bot.addCommand('@testapi', function () {
        let obj = {
            name: 'don',
            number: 1,
            active: true
        };

        //createTest(obj, (err, body, res) => {
        //    console.log(body);
        //    console.log(res);
        //})

        //Test.create(obj);
    });
}