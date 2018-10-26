import { ILog } from '../interfaces';
import { saveSystemLog } from '../services/firebase.service';

const toMilliseconds = require('@sindresorhus/to-milliseconds');

const utils = {
  /**
   * @method ms
   * @description Convert an object of time properties to milliseconds: {seconds: 2} → 2000
   * @param obj {Object} - object of time.
   * @return <number> - time in milliseconds.
   */
  ms: (obj: Object): number => toMilliseconds(obj),

  /**
   * @method thousands
   * @description Convert number to thousands string: 1000 → "1,000"
   * @param number {Number} - number
   * @return <string>
   */
  thousands: (number: number): string => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),


  sysLog: (
    type: 'info' | 'warning' | 'error',
    message: string,
    plugin: '~' | 'betting'| 'bpm' | 'voting' | 'apply' | 'poll',
    data: any = false,
  ) => {
    const log: ILog = { message, plugin, type, data };
    switch (type) {
      case 'error':
        console.error(log);
        break;
      case 'warning':
        console.warn(log);
        break;
      case 'info':
        console.info(log);
    }
    return saveSystemLog(log);
  },


  /**
   * @method normalizeCommand
   * @description Used to trim and lowercase incoming messages
   *              before attempting to call them in list of commands.
   * @param {string} inputMsg - message that needs to be converted.
   * @return {string} - return command.
   */
  normalizeMessage: (inputMsg: string): string => {
    const msgArray = inputMsg.trim().split(' ');
    const msg = msgArray[0];
    return msg.toLowerCase();
  },

};

export default utils;
