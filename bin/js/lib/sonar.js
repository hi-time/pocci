'use strict';
var util = require('./util.js');
var parse = require('url').parse;

module.exports = {
  addDefaults: function(options) {
    options.sonar               = options.sonar               || {};
    options.sonar.url           = options.sonar.url           || 'http://sonar.' + options.pocci.domain;
    options.sonar.securityRealm = options.sonar.securityRealm || 'LDAP';
    options.sonar.ldapRealName  = options.sonar.ldapRealName  || 'cn';
    options.sonar.dbUser        = options.sonar.dbUser        || 'sonarqube';
    options.sonar.dbPassword    = options.sonar.dbPassword    || 'sonarqubepass';
    options.sonar.dbName        = options.sonar.dbName        || 'sonarqubedb';
    options.sonar.dbHost        = options.sonar.dbHost        || parse(options.sonar.url).hostname;
    options.sonar.dbPort        = options.sonar.dbPort        || '5432';
  },
  addEnvironment: function(options, environment) {
    var url = parse(options.sonar.url);
    environment.SONAR_URL             = util.getHref(url);            // example codes
    environment.SONAR_PROTOCOL        = url.protocol;
    environment.SONAR_HOST            = url.hostname;                 // jenkins-slaves.yml
    environment.SONAR_PORT            = util.getPort(url);
    environment.SONAR_SECURITY_REALM  = options.sonar.securityRealm;  // xpfriend/sonarqube
    environment.SONAR_LDAP_REAL_NAME  = options.sonar.ldapRealName;   // xpfriend/sonarqube
    environment.SONAR_DB_USER         = options.sonar.dbUser;         // sameersbn/postgresql (sonarqubedb), jenkins-slaves (example codes)
    environment.SONAR_DB_PASS         = options.sonar.dbPassword;     // sameersbn/postgresql (sonarqubedb), jenkins-slaves (example codes)
    environment.SONAR_DB_NAME         = options.sonar.dbName;         // sameersbn/postgresql (sonarqubedb), jenkins-slaves (example codes)
    environment.SONAR_DB_HOST         = options.sonar.dbHost;         // xpfriend/sonarqube, jenkins-slaves (example codes)
    environment.SONAR_DB_PORT         = options.sonar.dbPort;         // sameersbn/postgresql (sonarqubedb), jenkins-slaves (example codes)
  }
};
