'use strict';
var fs = require('fs');
var LdapClient = require('promised-ldap');
var ssha = require('ssha');
var toArray = require('pocci/util.js').toArray;
var util = require('pocci/util.js');
var parse = require('url').parse;
var path = require('path');
var server = require('co-request');

var getAvatarImageDirectory = function() {
  return './config/avatar';
};

var getAvatarImageFileName = function(user) {
  return getAvatarImageDirectory() + '/' + user.uid + path.extname(user.labeledURI);
};

var cleanAvatarImages = function() {
  var avatarDir = getAvatarImageDirectory();
  if(fs.existsSync(avatarDir)) {
    fs.readdirSync(avatarDir).forEach(function(file) {
      fs.unlinkSync(path.join(avatarDir, file));
    });
  } else {
    fs.mkdirSync(avatarDir);
  }
};

var createAvatarImage = function*(user) {
  var fileName = getAvatarImageFileName(user);
  try {
    var parsedUrl = parse(user.labeledURI);
    if(parsedUrl.protocol === 'file:') {
      var src = path.join('./config', parsedUrl.pathname);
      fs.createReadStream(src).pipe(fs.createWriteStream(fileName));
    } else {
      var res = yield server({
        url: user.labeledURI,
        encoding : null
      });
      fs.writeFileSync(fileName, res.body, {encoding:'binary'});
    }
  } catch(e) {
    console.log('WARNING: cannot download: ' + user.labeledURI + ' --> ' + fileName);
    console.log(e);
  }
};

var addUsers = function*(client, users, baseDn) {
  cleanAvatarImages();
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

    if(user.labeledURI) {
      yield createAvatarImage(user);
    }
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
  },
  getAvatarImageDirectory: getAvatarImageDirectory,
  getAvatarImageFileName: getAvatarImageFileName
};
