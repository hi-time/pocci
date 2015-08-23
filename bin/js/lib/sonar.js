'use strict';

module.exports = {
  addDefaults: function(options) {
    options.sonar               = options.sonar               || {};
    options.sonar.host          = options.sonar.host          || 'sonar.' + options.pocci.domain;
    options.sonar.url           = options.sonar.url           || 'http://' + options.sonar.host;
    options.sonar.securityRealm = options.sonar.securityRealm || 'LDAP';
    options.sonar.ldapRealName  = options.sonar.ldapRealName  || 'cn';
    options.sonar.dbUser        = options.sonar.dbUser        || 'sonarqube';
    options.sonar.dbPassword    = options.sonar.dbPassword    || 'sonarqubepass';
    options.sonar.dbName        = options.sonar.dbName        || 'sonarqubedb';
  },
  addEnvironment: function(options, environment) {
    environment.SONAR_HOST            = options.sonar.host;           // jenkins-slaves.yml
    environment.SONAR_URL             = options.sonar.url;            // example codes
    environment.SONAR_SECURITY_REALM  = options.sonar.securityRealm;  // xpfriend/sonarqube
    environment.SONAR_LDAP_REAL_NAME  = options.sonar.ldapRealName;   // xpfriend/sonarqube
    environment.SONAR_DB_USER         = options.sonar.dbUser;         // sameersbn/postgresql (sonarqubedb), jenkins-slaves (example codes)
    environment.SONAR_DB_PASS         = options.sonar.dbPassword;     // sameersbn/postgresql (sonarqubedb), jenkins-slaves (example codes)
    environment.SONAR_DB_NAME         = options.sonar.dbName;         // sameersbn/postgresql (sonarqubedb), jenkins-slaves (example codes)
  }
};
