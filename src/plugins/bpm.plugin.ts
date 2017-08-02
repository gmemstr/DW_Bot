import { IPayload, TwitchBot } from '../bot';
import { putBits } from '../services/user.service';
import * as moment from 'moment';

export class BPMPlugin {

  constructor(private bot: TwitchBot) {

  }

  private ms(duration: number, measurement: 'minutes' | 'seconds' = 'minutes') {
    return moment.duration(duration, measurement).asMilliseconds();
  }

}
