/*jslint evil: true */
'use strict';
var assert = require('assert');
var urlparse = require('url').parse;
var urlformat = require('url').format;
var escape = require('querystring').escape;

module.exports = {
  toArray: function(obj){
    if(Array.isArray(obj)) {
      return obj;
    }

    if(obj) {
      return [obj];
    }
    
    return [];
  },
  copy: function(src, dst) {
    var obj = {};
    for(var dstKey in dst) {
      obj[dstKey] = dst[dstKey];
    }
    for(var srcKey in src) {
      obj[srcKey] = src[srcKey];
    }
    return obj;
  },
  getUser: function(user, ldapUsers) {
    var defaultUser = {
      uid: 'anonymous',
      userPassword: '',
      mail: 'anonymous@example.com'
    };

    if(typeof user === 'object') {
      return user;
    }

    if(!Array.isArray(ldapUsers) && typeof ldapUsers === 'object') {
      return ldapUsers;
    }

    if(!Array.isArray(ldapUsers) || ldapUsers.length === 0) {
      return defaultUser;
    }

    for(var i = 0; i < ldapUsers.length; i++) {
      if(user === ldapUsers[i].uid) {
        return ldapUsers[i];
      }
    }

    return ldapUsers[0];
  },
  getURL: function(url, user, path) {
    var p = urlparse(url);
    if(!p.auth && user && user.userPassword) {
      p.auth = escape(user.uid) + ':' + escape(user.userPassword);
    }
    if(path) {
      p.pathname = path;
    }
    return urlformat(p);
  },
  sortById: function(array) {
    array.sort(function(a, b) {
      return a.id - b.id;
    });
  },
  assertStatus: function(response, condition) {
    if(eval(condition)) {
      return;
    }

    console.log('== == == == == == == == == == ');
    console.log(response);
    console.log('== == == == == == == == == == ');
    
    var message = '\n  Unexpected status:' +
                  '\n    expected: ' + condition +
                  '\n    actual:   response.statusCode === ' + response.statusCode +
                  '\n    message:  ' + response.statusMessage +
                  '\n      href:     ' + response.request.href +
                  '\n      method:   ' + response.request.method +
                  '\n      body:     ' + JSON.stringify(response.request.body) +
                  '\n      headers:  ' + JSON.stringify(response.request.headers);
                  
    assert(false, message);
  },
  getPort: function(url) {
    if(url.port) {
      return url.port;
    }
    if(url.protocol === 'ldap:') {
      return '389';
    }
    if(url.protocol === 'https:') {
      return '443';
    }
    return '80';
  }
};
