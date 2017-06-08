import * as path from 'path';
import * as _ from 'lodash';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Public server configurations will extend these options
const all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true,
      },
    },
  },

  bot: {
    mods: ['divine_don', 'syntag', 'b3zman41'],
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
  require('./shared')['shared'],
  require(`./${process.env.NODE_ENV}`)[`${process.env.NODE_ENV}`]
);
