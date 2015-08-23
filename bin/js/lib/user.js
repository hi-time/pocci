'use strict';
var ldap = require('ldapjs');
var thunkify = require('thunkify');
var ssha = require('ssha');
var toArray = require('./util.js').toArray;

var addUsers = function*(client, users, baseDn) {
  var add = thunkify(client.add.bind(client));
  var del = thunkify(client.del.bind(client));

  for(var i = 0; i < users.length; i++) {
    var user = users[i];
    var plainPassword = user.userPassword;
    user.userPassword = ssha.create(plainPassword);
    user.objectclass = ['inetOrgPerson', 'top'];
    user.cn = user.cn || user.uid;
    var dn = 'cn=' + user.cn + ',' + baseDn;
    try {
      yield del(dn);
    } catch(err) {
      if(err.name === 'NoSuchObjectError') {
        console.log('  DELETE: ' + err.message + ' : ' + dn);
      } else {
        throw err;
      }
    }
    yield add(dn, user);
    user.userPassword = plainPassword;
  }
};

var bind = function*() {
  var client = ldap.createClient({url: process.env.LDAP_URL});
  var bind = thunkify(client.bind.bind(client));
  yield bind(process.env.LDAP_BIND_DN, process.env.LDAP_ADMIN_PASSWORD);
  return client;
};

module.exports = {
  addDefaults: function(options) {
    options.user      = options.user      || {};
    options.user.host = options.user.host || 'user.' + options.pocci.domain;
    options.user.url  = options.user.url  || 'http://' + options.user.host;
  },
  addEnvironment: function(options, environment) {
    environment.USER_HOST             = options.user.host;
    environment.USER_URL              = options.user.url;
    environment.LDAP_HOST             = options.ldap.host;          // osixia/phpLDAPadmin (v0.5.1)
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
