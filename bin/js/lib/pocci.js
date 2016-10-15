'use strict';
var path = require('path');

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
    options.pocci                   = options.pocci                   || {};
    options.pocci.environment       = options.pocci.environment       || {};
    options.pocci.domain            = options.pocci.domain            || process.env.POCCI_DOMAIN_NAME || 'pocci.test';
    options.pocci.services          = options.pocci.services          || ['gitlab'];
    options.pocci.externalServices  = options.pocci.externalServices  || [];
    options.pocci.hosts             = options.pocci.hosts             || [];
    options.pocci.logdir            = options.pocci.logdir            || path.resolve(process.env.POCCI_DIR, 'log');
    options.pocci.adminMailAddress  = options.pocci.adminMailAddress  || process.env.ADMIN_MAIL_ADDRESS || 'pocci@localhost.localdomain';
    options.pocci.https             = options.pocci.https             || process.env.POCCI_HTTPS || 'false';
    options.pocci.timezone          = options.pocci.timezone          || process.env.TZ || options.pocci.environment.TZ || 'Etc/UTC';
    options.pocci.certificate       = options.pocci.certificate       || {};
    options.pocci.certificate.subject = options.pocci.certificate.subject || '/C=JP/ST=Chiba/L=Chiba/O=Pocci/CN=*.' + options.pocci.domain + '/';
    options.pocci.network           = options.pocci.network           || '172.20.0.0/16';
    options.pocci.gateway           = options.pocci.gateway           || '172.20.0.1';
    options.pocci.dnsAddress        = options.pocci.dnsAddress        || '172.20.0.254';
    options.pocci.allServices       = options.pocci.services.concat(options.pocci.externalServices);
  },
  addEnvironment: function(options, environment) {
    environment.POCCI_DOMAIN_NAME = options.pocci.domain;
    environment.INTERNAL_SERVICES = getServices(options.pocci.services);
    environment.EXTERNAL_SERVICES = getServices(options.pocci.externalServices);
    environment.ALL_SERVICES      = [environment.INTERNAL_SERVICES, environment.EXTERNAL_SERVICES].join(' ').trim();
    environment.ALT_HOSTS         = options.pocci.hosts.join('|');
    environment.POCCI_LOG_DIR     = options.pocci.logdir;
    environment.ADMIN_MAIL_ADDRESS  = options.pocci.adminMailAddress;
    environment.POCCI_HTTPS         = options.pocci.https;
    environment.TZ                  = options.pocci.timezone;
    environment.CERTIFICATE_SUBJECT = options.pocci.certificate.subject;
    environment.POCCI_NETWORK       = options.pocci.network;
    environment.POCCI_GATEWAY       = options.pocci.gateway;
    environment.DNS_ADDRESS         = options.pocci.dnsAddress;
  }
};
