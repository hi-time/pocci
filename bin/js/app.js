'use strict';
var co = require('co');
var setup = require('pocci/setup.js').setup;

co(function*() {
  yield setup('./config/setup.yml');
  process.exit(0);
}).catch(function(err) {
  console.error(err);
  process.exit(1);
});
