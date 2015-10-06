/*jshint unused:false */
'use strict';
var fs = require('fs');

module.exports = {
  addDefaults: function(options) {
    options.fluentd       = options.fluentd       || {};
    options.fluentd.conf  = options.fluentd.conf  || '<match **>\n  type stdout\n</match>\n';
  },
  addEnvironment: function(options, environment) {
    fs.writeFileSync('./config/fluent.conf', options.fluentd.conf);
  }
};
