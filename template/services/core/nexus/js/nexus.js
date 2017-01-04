/*jshint camelcase: false */
'use strict';
var parse = require('url').parse;
var util = require('pocci/util.js');

var login = function*(browser, url) {
  yield browser.url(url)
    .pause(12000)
    .click('a[data-qtip="Sign in"]')
    .save('nexus-before-login')
    .pause(2000)
    .setValue('input[name="username"]', 'admin')
    .setValue('input[name="password"]', 'admin123')
    .click('a.x-btn-nx-primary-small')
    .pause(2000)
    .save('nexus-after-login');
};

var addNpmRealm = function*(browser, url) {
  yield browser.url(url + '/#admin/security/realms')
    .pause(1000)
    .click('li=npm Bearer Token Realm')
    .click('a[data-qtip="Add to Selected"]')
    .pause(1000)
    .save('nexus-before-addNpmRealm')
    .click('a.x-btn-nx-primary-small')
    .pause(1000)
    .save('nexus-after-addNpmRealm');
};

module.exports = {
  addDefaults: function(options) {
    options.nexus                         = options.nexus                         || {};
    options.nexus.url                     = options.nexus.url                     || 'http://nexus.' + options.pocci.domain;
    options.nexus.mavenRepositoryUrl      = options.nexus.mavenRepositoryUrl      || options.nexus.url + '/repository/maven-public';
    options.nexus.mavenReleaseUrl         = options.nexus.mavenReleaseUrl         || options.nexus.url + '/repository/maven-releases';
    options.nexus.mavenSnapshotUrl        = options.nexus.mavenSnapshotUrl        || options.nexus.url + '/repository/maven-snapshots';
    options.nexus.npmRegistryUrl          = options.nexus.npmRegistryUrl          || options.nexus.url + '/repository/npm-all';
    options.nexus.npmPrivateRegistryUrl   = options.nexus.npmPrivateRegistryUrl   || options.nexus.url + '/repository/npm-internal';
    options.nexus.bowerRegistryUrl        = options.nexus.bowerRegistryUrl        || options.nexus.url + '/repository/bower-all';
    options.nexus.bowerPrivateRegistryUrl = options.nexus.bowerPrivateRegistryUrl || options.nexus.url + '/repository/bower-internal';
  },
  addEnvironment: function(options, environment) {
    var url = parse(options.nexus.url);
    environment.NEXUS_URL        = util.getHref(url);
    environment.NEXUS_PROTOCOL   = url.protocol;
    environment.NEXUS_HOST       = url.hostname;
    environment.NEXUS_PORT       = util.getPort(url);

    if(options.pocci.allServices.indexOf('nexus') > -1) {
      environment.MAVEN_REPOSITORY_URL        = options.nexus.mavenRepositoryUrl;
      environment.MAVEN_RELEASE_URL           = options.nexus.mavenReleaseUrl;
      environment.MAVEN_SNAPSHOT_URL          = options.nexus.mavenSnapshotUrl;
      environment.NPM_REGISTRY_URL            = options.nexus.npmRegistryUrl;
      environment.NPM_PRIVATE_REGISTRY_URL    = options.nexus.npmPrivateRegistryUrl;
      environment.BOWER_REGISTRY_URL          = options.nexus.bowerRegistryUrl;
      environment.BOWER_PRIVATE_REGISTRY_URL  = options.nexus.bowerPrivateRegistryUrl;
    }
  },
  setup: function*(browser) {
    var url = process.env.NEXUS_URL;
    yield login(browser, url);
    yield addNpmRealm(browser, url);
  }
};
