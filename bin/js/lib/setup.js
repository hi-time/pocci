'use strict';
var fs = require('fs');
var gitlab = require('pocci/gitlab.js');
var user = require('pocci/user.js');
var yaml = require('pocci/yaml.js');
var webdriver = require('pocci/webdriver.js');

var initBrowser = function*() {
  if(!module.exports.browser) {
    yield webdriver.init();
    module.exports.browser = webdriver.browser;
  }
};

var setup = function*(yamlFile, keepOpenBrowser) {
  var options = yaml.load(yamlFile);

  if(!options.pocci || !options.pocci.services) {
    return;
  }
  var services = options.pocci.services;

  console.log('*** Start Selenium Webdriver...');
  yield initBrowser();
  var browser = module.exports.browser;

  if(services.indexOf('user') > -1) {
    console.log('*** Add users...');
    yield user.setup(browser, options);
  }

  if(services.indexOf('gitlab') > -1) {
    console.log('*** Setup gitlab...');
    yield gitlab.setup(browser, options);
  }

  var modules = fs.readdirSync(__dirname);
  for(var i = 0; i < modules.length; i++) {
    var fileName = modules[i];
    if(fileName.match(/\.js$/) && fileName !== 'setup.js' && 
        fileName !== 'user.js' && fileName !== 'gitlab.js') {
      var serviceName = fileName.split('.')[0];
      if(services.indexOf(serviceName) > -1) {
        var m = require('pocci/' + fileName);
        if(m.setup) {
          console.log('*** Setup ' + serviceName + '...');
          yield m.setup(browser, options);
        }
      }
    }
  }

  if(!keepOpenBrowser) {
    console.log('*** Closing browser...');
    yield browser.end();
  }
};

module.exports.setup = setup;
module.exports.initBrowser = initBrowser;
