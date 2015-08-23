'use strict';

var getServices = function(option) {
  var services = '';
  option.forEach(function(value) {
    if(services.length > 0) {
      services += ' ';
    }
    services += value;
  });
  return services;
};

module.exports = {
  addDefaults: function(options) {
    options.pocci             = options.pocci             || {};
    options.pocci.environment = options.pocci.environment || {};
    options.pocci.domain      = options.pocci.domain      || 'pocci.test';
    options.pocci.services    = options.pocci.services    || ['gitlab'];
  },
  addEnvironment: function(options, environment) {
    environment.POCCI_DOMAIN_NAME = options.pocci.domain;
    environment.POCCI_SERVICES    = getServices(options.pocci.services);
  }
};
