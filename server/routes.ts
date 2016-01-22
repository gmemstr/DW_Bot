
'use strict';

export default function(app) {
    // Insert routes below
    app.use('/api/random', require('./api/random'));
}