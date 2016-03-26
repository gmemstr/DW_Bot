'use strict';

export default function (app) {
  app.use('/api/test', require('./api/test'));
}
