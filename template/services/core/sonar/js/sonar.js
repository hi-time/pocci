'use strict';
var util = require('pocci/util.js');
var parse = require('url').parse;
var server = require('co-request');
var assertStatus = require('pocci/util.js').assertStatus;
var gitlab = require('pocci/gitlab.js');
var smtp = require('pocci/smtp.js');

var login = function*(browser, url, user, password) {
  yield browser.url(url + '/sessions/new')
    .save('sonar-before-login-by-' + user)
    .setValue('#login', user)
    .setValue('#password', password)
    .save('sonar-doing-login-by-' + user)
    .submitForm('#login_form')
    .pause(5000)
    .save('sonar-after-login-by-' + user);
};

var logout = function*(browser, url, user) {
  yield browser.url(url + '/sessions/logout')
    .save('sonar-after-logout-by-' + user);
};

var updateMailSetting = function*(browser, url) {
  yield login(browser, url, 'admin', 'admin');
  yield browser.url(url + '/email_configuration')
    .save('sonar-before-updateMailSetting')
    .setValue('#smtp_host', process.env.SONAR_SMTP_HOST)
    .setValue('#smtp_port', process.env.SONAR_SMTP_PORT)
    .setValue('#email_from', process.env.SONAR_MAIL_ADDRESS)
    .save('sonar-doing-updateMailSetting')
    .click('#submit_save')
    .save('sonar-after-updateMailSetting');
  yield logout(browser, url, 'admin');
};

var updateGitLabSetting = function*(browser, url, gitlabUrl, apiToken) {
  yield login(browser, url, 'admin', 'admin');
  yield browser.url(url + '/settings?category=gitlab')
    .save('sonar-before-updateGitLabSetting')
    .setValue('[name="settings[sonar.gitlab.url]"]', gitlabUrl)
    .save('sonar-doing-updateGitLabSetting')
    .click('button.js-save-changes')
    .save('sonar-doing-updateGitLabSetting')
    .setValue('[name="settings[sonar.gitlab.user_token]"]', apiToken)
    .save('sonar-doing-updateGitLabSetting')
    .click('button.js-save-changes')
    .save('sonar-after-updateGitLabSetting');
  yield logout(browser, url, 'admin');
};

var isEnabledUserService = function(options) {
  if(options.pocci.services.indexOf('user') > -1) {
    return true;
  }
  if(options.pocci.externalServices.indexOf('user') > -1) {
    return true;
  }
  return false;
};

var createRequest = function(url, path, body) {
  return {
    url: url + path,
    json: true,
    auth: {
      user: 'admin',
      pass: 'admin',
      sendImmediately: true
    },
    form: body
  };
};

var post = function*(url, path, body) {
  var request = createRequest(url, path, body);
  var response = yield server.post(request);
  if(response.body) {
    console.log(JSON.stringify(response.body));
  }
  assertStatus(response, 'response.statusCode < 300');
};

var createPowerUsers = function*(browser, url) {
  yield post(url, '/api/user_groups/create', {
    name: 'power-users'
  });
  yield post(url, '/api/permissions/add_group_to_template', {
    groupName: 'power-users',
    permission: 'issueadmin',
    templateName: 'Default template'
  });
};

var addUsers = function*(browser, url, users) {
  for(var i = 0; i < users.length; i++) {
    yield login(browser, url, users[i].uid, users[i].userPassword);
    yield logout(browser, url, users[i].uid);
  }
};

var updateUserRole = function*(browser, url, users) {
  for(var i = 0; i < users.length; i++) {
    yield post(url, '/api/user_groups/add_user', {
      name: 'power-users',
      login: users[i].uid
    });
  }
};

module.exports = {
  addDefaults: function(options) {
    options.sonar               = options.sonar               || {};
    options.sonar.url           = options.sonar.url           || 'http://sonar.' + options.pocci.domain;
    options.sonar.securityRealm = options.sonar.securityRealm || (isEnabledUserService(options)? 'LDAP' : '');
    options.sonar.ldapRealName  = options.sonar.ldapRealName  || 'cn';
    options.sonar.dbUser        = options.sonar.dbUser        || 'sonarqube';
    options.sonar.dbPassword    = options.sonar.dbPassword    || util.getRandomString();
    options.sonar.smtpHost      = options.sonar.smtpHost      || smtp.getHost(options);
    options.sonar.smtpPort      = options.sonar.smtpPort      || smtp.getPort(options);
    options.sonar.mailAddress   = options.sonar.mailAddress   || options.pocci.adminMailAddress;
  },
  addEnvironment: function(options, environment) {
    var url = parse(options.sonar.url);
    environment.SONAR_URL             = util.getHref(url);            // example codes
    environment.SONAR_PROTOCOL        = url.protocol;
    environment.SONAR_HOST            = url.hostname;                 // workspaces.yml
    environment.SONAR_PORT            = util.getPort(url);
    environment.SONAR_SECURITY_REALM  = options.sonar.securityRealm;  // xpfriend/sonarqube
    environment.SONAR_LDAP_REAL_NAME  = options.sonar.ldapRealName;   // xpfriend/sonarqube
    environment.SONAR_DB_USER         = options.sonar.dbUser;         // sameersbn/postgresql (sonarqubedb)
    environment.SONAR_DB_PASS         = options.sonar.dbPassword;     // sameersbn/postgresql (sonarqubedb)
    environment.SONAR_SMTP_HOST       = options.sonar.smtpHost;       // xpfriend/sonarqube
    environment.SONAR_SMTP_PORT       = options.sonar.smtpPort;       // xpfriend/sonarqube
    environment.SONAR_MAIL_ADDRESS    = options.sonar.mailAddress;    // xpfriend/sonarqube
  },
  setup: function*(browser, options) {
    var sonarOptions = options.sonar || {};
    var userOptions = options.user || {};
    var isEnabledGitLab = process.env.ALL_SERVICES.indexOf('gitlab') > -1;
    var users = util.toArray(sonarOptions.users || userOptions.users);
    var url = process.env.SONAR_URL;

    yield updateMailSetting(browser, url);
    yield createPowerUsers(browser, url);
    if(users.length > 0) {
      yield addUsers(browser, url, users);
      yield updateUserRole(browser, url, users);
    }

    if(isEnabledGitLab) {
      var loginUser = util.getUser(sonarOptions.user, users);
      var gitlabUrl = process.env.GITLAB_URL;
      yield gitlab.loginAs(browser, gitlabUrl, loginUser);
      var apiToken = yield gitlab.getPrivateToken(browser, gitlabUrl);
      yield updateGitLabSetting(browser, url, gitlabUrl, apiToken);
      yield gitlab.logout(browser);
    }
  }
};
