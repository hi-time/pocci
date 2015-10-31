'use strict';
var git = require('./git.js');
var gitlab = require('./gitlab.js');
var jenkins = require('./jenkins.js');
var slave = require('./slave.js');
var user = require('./user.js');
var redmine = require('./redmine.js');
var yaml = require('./yaml.js');
var webdriver = require('./webdriver.js');
var kanban = require('./kanban.js');

var initBrowser = function*() {
  if(!module.exports.browser) {
    yield webdriver.init();
    module.exports.browser = webdriver.browser;
  }
};

var setup = function*(yamlFile, keepOpenBrowser) {
  var options = yaml(yamlFile);

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
    console.log('*** Setup GitLab...');
    yield gitlab.setup(browser, options);
  }

  if(services.indexOf('redmine') > -1) {
    console.log('*** Setup Redmine...');
    yield redmine.setup(browser, options);
  }

  if(options.repositories && options.repositories.length > 0) {
    console.log('*** Import codes to Git repository...');
    yield git.setup(browser, options);
  }

  if(services.indexOf('jenkins') > -1) {
    console.log('*** Setup Jenkins...');
    yield jenkins.setup(browser, options);
  }

  if(services.indexOf('slave') > -1) {
    console.log('*** Setup Jenkins slave...');
    yield slave.setup(browser, options);
  }

  if(services.indexOf('kanban') > -1) {
    console.log('*** Setup Kanban...');
    yield kanban.setup(browser, options);
  }

  if(!keepOpenBrowser) {
    console.log('*** Closing browser...');
    yield browser.end();
  }
};

module.exports.setup = setup;
module.exports.initBrowser = initBrowser;
module.exports.gitlab = gitlab;
module.exports.git = git;
module.exports.jenkins = jenkins;
module.exports.redmine = redmine;
module.exports.kanban = kanban;
