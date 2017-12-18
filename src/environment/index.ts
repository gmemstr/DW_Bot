/* tslint:disable */
import * as _ from 'lodash';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Public server configurations will extend these options
const all = {
  env: process.env.NODE_ENV,

  bot: {
    options: {
      debug: true,
    },
    connection: {
      random: 'chat',
      reconnect: true,
    },
    commandCharacter: '!',
  },

};


export default <any>_.merge(
  all,
  require('./shared')['shared'] || {},
  require(`./${process.env.NODE_ENV}`)[`${process.env.NODE_ENV}`]
);
