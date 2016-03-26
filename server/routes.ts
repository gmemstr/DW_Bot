'use strict';

export default function (app) {
  app.use('/api/test', require('./api/test'));

  app.route('/*').get((req, res) => {
    console.log("Are you lost?");
  })
}
