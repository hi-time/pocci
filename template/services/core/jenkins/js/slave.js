'use strict';
var jenkins = require('pocci/jenkins.js');

module.exports = {
  setup: function*(browser, options) {
    yield jenkins.handleSetup(browser, options, 'slave');
  }
};
