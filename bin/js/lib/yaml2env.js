'use strict';
var yaml = require('./yaml.js');
var ldapDefaults = require('./ldap.js').defaults;
var pocciDefaults = require('./pocci.js').defaults;

var getServices = function(option) {
  if(!option) {
    return 'gitlab';
  }

  var services = '';
  option.forEach(function(value) {
    if(services.length > 0) {
      services += ' ';
    }
    services += value;
  });
  return services;
};

module.exports = function(yamlFile) {
  var options = yaml(yamlFile);

  options.ldap = options.ldap || {};
  options.pocci = options.pocci || {};

  var pocciDomain = options.pocci.domain || pocciDefaults.domain;
  var ldapHost = options.ldap.host || ldapDefaults.host;
  var ldapDomain = options.ldap.domain || ldapDefaults.domain;
  var organisation = options.ldap.organisation || ldapDefaults.organisation;
  var bindDn = options.ldap.bindDn || ldapDefaults.bindDn;
  var bindPassword = options.ldap.bindPassword || ldapDefaults.bindPassword;
  var baseDn = options.ldap.baseDn || ldapDefaults.baseDn;

  console.log('POCCI_DOMAIN_NAME=' + pocciDomain);
  console.log('POCCI_SERVICES=' + getServices(options.pocci.services));
  console.log('LDAP_HOST=' + ldapHost);
  console.log('LDAP_DOMAIN=' + ldapDomain);
  console.log('LDAP_ORGANISATION=' + organisation);
  console.log('LDAP_LOGIN_DN=' + bindDn);
  console.log('LDAP_BIND_DN=' + bindDn);
  console.log('LDAP_BIND_PASSWORD=' + bindPassword);
  console.log('LDAP_ADMIN_PASSWORD=' + bindPassword);
  console.log('LDAP_PASS=' + bindPassword);
  console.log('LDAP_BASE_DN=' + baseDn);
  console.log('LDAP_BASE=' + baseDn);

  if(options.pocci.environment) {
    for(var i = 0; i < options.pocci.environment.length; i++) {
      console.log(options.pocci.environment[i]);
    }
  }

};
