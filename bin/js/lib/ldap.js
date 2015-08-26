'use strict';
var parse = require('url').parse;
var util = require('./util.js');

module.exports = {
  addDefaults: function(options) {
    options.ldap                = options.ldap                || {};
    options.ldap.url            = options.ldap.url            || 'ldap://user.' + options.pocci.domain;
    options.ldap.domain         = options.ldap.domain         || 'example.com';
    options.ldap.baseDn         = options.ldap.baseDn         || 'dc=example,dc=com';
    options.ldap.bindDn         = options.ldap.bindDn         || 'cn=admin,dc=example,dc=com';
    options.ldap.bindPassword   = options.ldap.bindPassword   || 'admin';
    options.ldap.organisation   = options.ldap.organisation   || 'Example Inc.';
    options.ldap.attrLogin      = options.ldap.attrLogin      || 'uid';
    options.ldap.attrFirstName  = options.ldap.attrFirstName  || 'givenName';
    options.ldap.attrLastName   = options.ldap.attrLastName   || 'sn';
    options.ldap.attrMail       = options.ldap.attrMail       || 'mail';
  },
  addEnvironment: function(options, environment) {
    var url = parse(options.ldap.url);
    environment.LDAP_URL              = util.getHref(url);          // user.js, jenkins.js
    environment.LDAP_PROTOCOL         = url.protocol;
    environment.LDAP_HOST             = url.hostname;               // redmine.js, xpfriend/sonarqube, osixia/phpLDAPadmin (v0.5.1)
    environment.LDAP_PORT             = util.getPort(url);
    environment.LDAP_DOMAIN           = options.ldap.domain;        // osixia/openldap
    environment.LDAP_BASE_DN          = options.ldap.baseDn;        // jenkins.js, redmine.js, user.js, xpfriend/sonarqube
    environment.LDAP_BIND_DN          = options.ldap.bindDn;        // jenkins.js, redmine.js, user.js, xpfriend/sonarqube, sameersbn/gitlab
    environment.LDAP_BIND_PASSWORD    = options.ldap.bindPassword;  // jenkins.js, redmine.js, xpfriend/sonarqube
    environment.LDAP_ORGANISATION     = options.ldap.organisation;  // osixia/openldap
    environment.LDAP_ATTR_LOGIN       = options.ldap.attrLogin;     // jenkins.js, redmine.js, xpfriend/sonarqube, sameersbn/gitlab
    environment.LDAP_ATTR_FIRST_NAME  = options.ldap.attrFirstName; // redmine.js
    environment.LDAP_ATTR_LAST_NAME   = options.ldap.attrLastName;  // redmine.js
    environment.LDAP_ATTR_MAIL        = options.ldap.attrMail;      // redmine.js, xpfriend/sonarqube
  }
};
