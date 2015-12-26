/*jshint camelcase: false */
'use strict';
var fs = require('fs');
var yaml = require('pocci/yaml.js');
var pocci = require('pocci/pocci.js');

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
  var modules = fs.readdirSync(__dirname);
  var config = [pocci];
  for(var i = 0; i < modules.length; i++) {
    if(modules[i] !== 'pocci.js' && modules[i].match(/\.js$/)) {
      var m = require('pocci/' + modules[i]);
      if(m.addDefaults) {
        config.push(m);
      }
    }
  }

  for(i = 0; i < config.length; i++) {
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
