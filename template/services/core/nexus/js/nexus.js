/*jshint camelcase: false */
'use strict';
var parse = require('url').parse;
var util = require('pocci/util.js');

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
  }
};
