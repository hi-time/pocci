'use strict';
var ldap = require('ldapjs');
var thunkify = require('thunkify');
var ssha = require('ssha');
var toArray = require('./util.js').toArray;
var util = require('./util.js');
var parse = require('url').parse;

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
    options.user.url  = options.user.url  || 'http://user.' + options.pocci.domain;
  },
  addEnvironment: function(options, environment) {
    var url = parse(options.user.url);
    environment.USER_URL              = util.getHref(url);          // example codes
    environment.USER_PROTOCOL         = url.protocol;
    environment.USER_HOST             = url.hostname;               // jenkins-slaves.yml
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
