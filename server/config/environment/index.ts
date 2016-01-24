import * as path from 'path';
import * as _ from 'lodash';

// Public server configurations will extend these options

var all = {
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
        safe: true
      }
    }
  },

};


export default <any>_.merge(
  all,
  require('./shared')['shared'],
  require(`./${process.env.NODE_ENV}`)[`${process.env.NODE_ENV}`]
);
