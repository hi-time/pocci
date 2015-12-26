'use strict';
var LdapClient = require('promised-ldap');
var ssha = require('ssha');
var toArray = require('pocci/util.js').toArray;
var util = require('pocci/util.js');
var parse = require('url').parse;

var addUsers = function*(client, users, baseDn) {
  for(var i = 0; i < users.length; i++) {
    var user = users[i];
    var plainPassword = user.userPassword;
    user.userPassword = ssha.create(plainPassword);
    user.objectclass = ['inetOrgPerson', 'top'];
    user.cn = user.cn || user.uid;
    var dn = 'cn=' + user.cn + ',' + baseDn;
    try {
      yield client.del(dn);
    } catch(err) {
      if(err.name === 'NoSuchObjectError') {
        console.log('  DELETE: ' + err.message + ' : ' + dn);
      } else {
        throw err;
      }
    }
    yield client.add(dn, user);
    user.userPassword = plainPassword;
  }
};

var bind = function*() {
  var client = new LdapClient({url: process.env.LDAP_URL});
  yield client.bind(process.env.LDAP_BIND_DN, process.env.LDAP_ADMIN_PASSWORD);
  return client;
};

module.exports = {
  addDefaults: function(options) {
    options.user      = options.user      || {};
    options.user.url  = options.user.url  || 'http://user.' + options.pocci.domain;
  },
  addEnvironment: function(options, environment) {
    var url = parse(options.user.url);
    environment.USER_URL              = util.getHref(url);          // example codes
    environment.USER_PROTOCOL         = url.protocol;
    environment.USER_HOST             = url.hostname;               // workspaces.yml
    environment.USER_PORT             = util.getPort(url);
    environment.LDAP_ADMIN_PASSWORD   = options.ldap.bindPassword;  // osixia/openldap
  },
  setup: function*(browser, options) {
    if(!options.user || !options.user.users) {
      return;
    }
    var client = yield bind();
    yield addUsers(client, toArray(options.user.users), process.env.LDAP_BASE_DN);
  }
};
