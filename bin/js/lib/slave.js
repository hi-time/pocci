'use strict';
var jenkins = require('./jenkins.js');

module.exports = {
  setup: function*(browser, options) {
    yield jenkins.handleSetup(browser, options, 'slave');
  }
};
