'use strict';
var git = require('./git.js');
var gitlab = require('./gitlab.js');
var jenkins = require('./jenkins.js');
var ldap = require('./ldap.js');
var redmine = require('./redmine.js');
var yaml = require('./yaml.js');
var webdriver = require('./webdriver.js');

var initBrowser = function*() {
  if(!module.exports.browser) {
    yield webdriver.init();
    module.exports.browser = webdriver.browser;
  }
};

var setup = function*(yamlFile, keepOpenBrowser) {
  var options = yaml(yamlFile);

  if(options.ldap) {
    console.log('*** Add users...');
    yield ldap.add(options.ldap);
  }

  var browser;
  if(options.gitlab || options.jenkins || options.redmine) {
    console.log('*** Start Selenium Webdriver...');
    yield initBrowser();
    browser = module.exports.browser;
  }

  var repositories = [];

  if(options.gitlab) {
    console.log('*** Setup GitLab...');
    yield gitlab.setup(browser, options.gitlab, options.ldap, repositories, options.redmine);
  }

  if(options.redmine) {
    console.log('*** Setup Redmine...');
    yield redmine.setup(browser, options.redmine, options.ldap, options.gitlab);
  }

  if(repositories.length > 0) {
    console.log('*** Import codes to Git repository...');
    yield git.import(repositories, options.ldap);
  }

  if(options.jenkins) {
    console.log('*** Setup Jenkins...');
    yield jenkins.setup(browser, options.jenkins, options.ldap, repositories);
  }

  if(browser && !keepOpenBrowser) {
    console.log('*** Closing browser...');
    yield browser.yieldable.end();
  }
};

module.exports.setup = setup;
module.exports.initBrowser = initBrowser;
module.exports.gitlab = gitlab;
module.exports.git = git;
module.exports.jenkins = jenkins;
module.exports.redmine = redmine;
