/*jshint unused:false */
'use strict';
var parse = require('url').parse;
var util = require('pocci/util.js');
var toArray = require('pocci/util.js').toArray;

var getMydestination = function(url) {
  var dot =  url.hostname.indexOf('.');
  var hostname = url.hostname.substring(0, dot);
  var mydomain = url.hostname.substring(dot + 1);
  return [
      hostname, 'localhost',
      mydomain, 'localdomain',
      url.hostname, hostname + '.localdomain',
      'localhost.' + mydomain, 'localhost.localdomain',
      'example.com', 'example.net'
  ];
};

var getLocalUser = function(localhosts, address) {
  if(!address) {
    return null;
  }

  for(var i = 0; i < localhosts.length; i++) {
    var mm = address.match(localhosts[i]);
    if(mm) {
      return address.substring(0, mm.index);
    }
  }
  return null;
};

var getLocalhosts = function(mydestination) {
  var localhosts = [];
  for(var i = 0; i < mydestination.length; i++) {
    localhosts.push(new RegExp('@' + mydestination[i] + '$'));
  }
  return localhosts;
};

var getAliasesInternal = function(mydestination, users, adminMailAddress) {
  var aliases = [];
  var localhosts = getLocalhosts(mydestination);
  var admin = getLocalUser(localhosts, adminMailAddress);
  var address;
  if(admin) {
    address = 'root';
    if(admin !== address) {
      aliases.push(admin);
    }
  } else {
    address = adminMailAddress;
  }
  for(var i = 0; i < users.length; i++) {
    var user = users[i];
    var localUser = getLocalUser(localhosts, user.mail);
    if(localUser) {
      aliases.push(localUser);
    }
  }
  return aliases.join(':' + address +' ') + ':' + address;
};

var getAliases = function(options) {
  if(!options.user || !options.user.users) {
    return;
  }

  return getAliasesInternal(
      options.smtp.mydestination,
      toArray(options.user.users),
      options.pocci.adminMailAddress
  );
};

var getUrl = function(options) {
  if(!options.smtp) {
    options.smtp = {};
  }
  if(!options.smtp.url) {
    options.smtp.url = 'http://smtp.' + options.pocci.domain;
  }
  return parse(options.smtp.url);
};

var getPortInternal = function(options) {
  return '25';
};

module.exports = {
  getDomain: function(options) {
    var hostname = getUrl(options).hostname;
    var dot = hostname.indexOf('.');
    return hostname.substring(dot + 1);
  },
  getHost: function(options) {
    return getUrl(options).hostname;
  },
  getPort: function(options) {
    return getPortInternal(options);
  },
  addDefaults: function(options) {
    getUrl(options);
    options.smtp.relayhost      = options.smtp.relayhost      || process.env.SMTP_RELAYHOST || '';
    options.smtp.password       = options.smtp.password       || process.env.SMTP_PASSWORD || '';
    options.smtp.mynetworks     = options.smtp.mynetworks     || process.env.SMTP_MYNETWORKS || '172.17.0.0/16';
    options.smtp.mydestination  = options.smtp.mydestination  || getMydestination(parse(options.smtp.url));
    options.smtp.aliases        = options.smtp.aliases        || getAliases(options);
  },
  addEnvironment: function(options, environment) {
    var url = parse(options.smtp.url);
    environment.SMTP_HOST           = url.hostname;
    environment.SMTP_PORT           = getPortInternal(options);
    environment.SMTP_RELAYHOST      = options.smtp.relayhost;
    environment.SMTP_PASSWORD       = options.smtp.password;
    environment.SMTP_MYNETWORKS     = options.smtp.mynetworks;
    environment.SMTP_MYDESTINATION  = options.smtp.mydestination.join(', ');
    environment.SMTP_ALIASES        = options.smtp.aliases;
  }
};
