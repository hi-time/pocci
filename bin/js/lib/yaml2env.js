/*jshint camelcase: false */
'use strict';
var yaml = require('./yaml.js');
var pocci = require('./pocci.js');
var ldap = require('./ldap.js');
var user = require('./user.js');
var gitlab = require('./gitlab.js');
var jenkins = require('./jenkins.js');
var kanban = require('./kanban.js');
var redmine = require('./redmine.js');
var sonar = require('./sonar.js');
var fluentd = require('./fluentd.js');

var updateByUserEnvironment = function(environment, userEnvironment) {
  var names = Object.keys(userEnvironment);
  for(var i = 0; i < names.length; i++) {
    var name = names[i];
    environment[name] = userEnvironment[name];
  }
};

var addUrl = function(environment, services, serviceUrl, allServiceUrl) {
  for(var i = 0; i < services.length; i++) {
    var key = services[i].toUpperCase() + '_URL';
    if(environment[key]) {
      var value = environment[key];
      allServiceUrl.push(value);
      serviceUrl.push(value);
    }
  }
};

module.exports = function(yamlFile) {
  var options = yaml(yamlFile);
  var config = [pocci, ldap, user, gitlab, jenkins, kanban, redmine, sonar, fluentd];

  for(var i = 0; i < config.length; i++) {
    config[i].addDefaults(options);
  }

  var environment = {};
  for(i = 0; i < config.length; i++) {
    config[i].addEnvironment(options, environment);
  }

  updateByUserEnvironment(environment, options.pocci.environment);

  var names = Object.keys(environment);
  for(i = 0; i < names.length; i++) {
    var name = names[i];
    console.log(name + '=' + environment[name]);
  }

  var allServiceUrl = [];
  var internalServiceUrl = [];
  var externalServiceUrl = [];

  addUrl(environment, options.pocci.services, internalServiceUrl, allServiceUrl);
  addUrl(environment, options.pocci.externalServices, externalServiceUrl, allServiceUrl);

  console.log('ALL_SERVICE_URL=' + allServiceUrl.join(' '));
  console.log('INTERNAL_SERVICE_URL=' + internalServiceUrl.join(' '));
  console.log('EXTERNAL_SERVICE_URL=' + externalServiceUrl.join(' '));
};
