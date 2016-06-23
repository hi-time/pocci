/*jshint sub:true*/
'use strict';

var server = require('co-request');
var assertStatus = require('pocci/util.js').assertStatus;
var toArray = require('pocci/util.js').toArray;
var copy = require('pocci/util.js').copy;
var util = require('pocci/util.js');
var parse = require('url').parse;
var gitlab = require('pocci/gitlab.js');

var logout = function*(browser, user) {
  user = user || 'unknown';
  yield browser.save('redmine-before-logout-by-' + user)
    .click('a.logout')
    .save('redmine-after-logout-by-' + user);
};

var login = function*(browser, url, user, password) {
  yield browser.url(url + '/login')
    .save('redmine-before-login-by-' + user)
    .setValue('#username', user)
    .setValue('#password', password)
    .save('redmine-doing-login-by-' + user)
    .submitForm('#login-form form')
    .save('redmine-after-login-by-' + user);
};

var loginByAdmin = function*(browser, url) {
  yield login(browser, url, 'admin', 'admin');
};

var exists = function*(browser, selector) {
  return yield browser.isExisting(selector);
};

var loadDefaultConfiguration = function*(browser, url) {
  yield browser.url(url + '/admin')
    .save('redmine-before-loadDefaultConfiguration');

  if(yield exists(browser, '#admin-index form')) {
    yield browser.save('redmine-doing-loadDefaultConfiguration')
      .submitForm('#admin-index form')
      .save('redmine-after-loadDefaultConfiguration');
  }

  var hostName = process.env.REDMINE_HOST;
  if(process.env.REDMINE_PORT !== '80') {
    hostName = hostName + ':' + process.env.REDMINE_PORT;
  }

  yield browser.url(url + '/settings')
    .save('redmine-before-configureHostname')
    .setValue('#settings_host_name', hostName)
    .save('redmine-doing-configureHostname')
    .click('#tab-content-general > form > input[type="submit"]')
    .save('redmine-after-configureHostname')
    .url(url + '/settings?tab=notifications')
    .save('redmine-before-configureNotifications');
  if(yield exists(browser, '#settings_mail_from')) {
    yield browser.setValue('#settings_mail_from', process.env.REDMINE_MAIL_ADDRESS)
      .save('redmine-doing-configureNotifications')
      .click('#tab-content-notifications > form > input[type="submit"]')
      .save('redmine-after-configureNotifications');
  }
};

var enableWebService = function*(browser, url) {
  yield browser.url(url + '/settings?tab=api')
    .save('redmine-before-enableWebService');

  var isSelected = yield browser.isSelected('#settings_rest_api_enabled');
  if (!isSelected) {
    yield browser.save('redmine-doing-enableWebService')
      .click('#settings_rest_api_enabled')
      .save('redmine-doing-enableWebService')
      .click('#tab-content-api > form > input[type="submit"]')
      .save('redmine-after-enableWebService');
  }
};

var enableLdap = function*(browser, url) {
  yield browser.url(url + '/auth_sources/1/edit');

  if(!(yield exists(browser, '#auth_source_name'))) {
    yield browser.url(url + '/auth_sources/new');
  }

  yield browser.save('redmine-before-enableLdap')
    .setValue('#auth_source_name', 'ldap')
    .setValue('#auth_source_host', process.env.LDAP_HOST)
    .setValue('#auth_source_port', process.env.LDAP_PORT)
    .setValue('#auth_source_account', process.env.LDAP_BIND_DN)
    .setValue('#auth_source_account_password', process.env.LDAP_BIND_PASSWORD)
    .setValue('#auth_source_base_dn', process.env.LDAP_BASE_DN)
    .setValue('#auth_source_timeout', 60)
    .setValue('#auth_source_attr_login', process.env.LDAP_ATTR_LOGIN)
    .setValue('#auth_source_attr_firstname', process.env.LDAP_ATTR_FIRST_NAME)
    .setValue('#auth_source_attr_lastname', process.env.LDAP_ATTR_LAST_NAME)
    .setValue('#auth_source_attr_mail', process.env.LDAP_ATTR_MAIL);

  var isSelected = yield browser.isSelected('#auth_source_onthefly_register');
  if (!isSelected) {
    yield browser.save('redmine-doing-enableLdap')
      .click('#auth_source_onthefly_register');
  }
  yield browser.save('redmine-doing-enableLdap')
    .click('#auth_source_form > input[type="submit"]')
    .save('redmine-after-enableLdap');
};

var createRequest = function*(browser, url) {
  yield browser.url(url + '/my/api_key')
    .save('redmine-before-createRequest');

  var key = yield browser.getHTML('#content pre', false);
  yield browser.save('redmine-after-createRequest');

  return function(path, body) {
    var request = {
      url: url + path,
      json: true,
      headers: {
        'X-Redmine-API-Key': key,
        'Content-Type': 'application/json'
      }
    };
    if(body) {
      request.body = body;
    }
    return request;
  };
};

var getProject = function*(request, projectName) {
  var response = yield server.get(request('/projects/' + projectName + '.json'));
  if(response.statusCode === 404) {
    return null;
  }
  assertStatus(response, 'response.statusCode < 300');

  return response.body.project;
};

var createProject = function*(browser, url, projectName) {
  yield browser.url(url + '/projects/new')
    .save('redmine-before-createProject-' + projectName)
    .setValue('#project_name', projectName)
    .setValue('#project_identifier', projectName)
    .save('redmine-doing-createProject-' + projectName)
    .click('input[type="submit"][name="commit"]')
    .save('redmine-after-createProject-' + projectName);
};

var createRepository = function*(browser, url, projectName, repository) {
  yield browser.url(url + '/projects/' + projectName + '/repositories/new')
    .save('redmine-before-createRepository-' + projectName + '-' + repository.projectName)
    .selectByValue('#repository_scm', 'Git')
    .pause(1000)
    .save('redmine-doing-createRepository-' + projectName + '-' + repository.projectName)
    .setValue('#repository_url', '/home/git/data/repositories/' + projectName + '/' + repository.projectName + '.git')
    .setValue('#repository_identifier', repository.projectName)
    .save('redmine-doing-createRepository-' + projectName + '-' + repository.projectName)
    .submitForm('#repository-form')
    .save('redmine-after-createRepository-' + projectName + '-' + repository.projectName);
};

var getUsers = function*(request) {
  var response = yield server.get(request('/users.json'));
  assertStatus(response, 'response.statusCode < 300');

  return response.body.users;
};

var getProjectMembers = function*(request, projectName) {
  var response = yield server.get(request('/projects/' + projectName + '/memberships.json'));
  assertStatus(response, 'response.statusCode < 300');

  var memberships = response.body.memberships;
  var members = {};
  for(var i = 0; i < memberships.length; i++) {
    var id = memberships[i].user.id;
    members[id] = id;
  }
  return members;
};

var addProjectMember = function*(request, projectName, login, projectMembers, users) {

  var addProject = function*(id) {
    var response = yield server.post(
      request(
        '/projects/' + projectName + '/memberships.json', {
        membership : {
          'user_id' : id,
          'role_ids' : [3, 4]
        }
      }
    ));
    assertStatus(response, 'response.statusCode < 300');
  };

  for(var i = 0; i < users.length; i++) {
    var user = users[i];
    if(user.login === login) {
      if(!projectMembers[user.id]) {
        yield addProject(user.id);
      }
      return;
    }
  }

  throw new Error('cannot find user : ' + login);
};

var showStatus = function(response) {
  try {
    assertStatus(response, 'response.statusCode < 300');
  } catch(e) {
    console.log(e);
  }
};

var postIssue = function*(request, issue) {
  var response = yield server.post(request('/issues.json', {'issue' : issue}));
  showStatus(response);
};

var putIssue = function*(request, issue) {
  var response = yield server.put(request('/issues/' + issue.id + '.json', {'issue' : issue}));
  showStatus(response);
};

var createIssue = function*(request, projectId, issueOrSubject, projectIssues) {
  var issue;

  if(typeof issueOrSubject === 'object') {
    issue = issueOrSubject;
    issue['project_id'] = projectId;
    issue['tracker_id'] = issue['tracker_id'] || 3;
  } else {
    issue = {
      'project_id' : projectId,
      'tracker_id' : 3,
      'subject' : '' + issueOrSubject
    };
  }

  var projectIssue = projectIssues[issue.subject];
  if(projectIssue) {
    issue = copy(issue, projectIssue);
  }

  if(projectIssue) {
    yield putIssue(request, issue);
  } else {
    yield postIssue(request, issue);
  }
};

var createRepositories = function*(browser, url, projectName, repositories) {
  for(var i = 0; i < repositories.length; i++) {
    yield createRepository(browser, url, projectName, repositories[i]);
  }
};

var addProjectMembers = function*(request, projectName, members) {
  var projectMembers = yield getProjectMembers(request, projectName);
  var users = yield getUsers(request);

  for(var i = 0; i < members.length; i++) {
    yield addProjectMember(request, projectName, members[i], projectMembers, users);
  }
};

var getProjectIssues = function*(request, projectId) {
  var response = yield server.get(request('/issues.json?project_id=' + projectId));
  assertStatus(response, 'response.statusCode < 300');

  var projectIssues = {};
  var issues = response.body.issues;
  for(var i = 0; i < issues.length; i++) {
    projectIssues[issues[i].subject] = issues[i];
  }
  return projectIssues;
};

var createIssues = function*(request, projectId, issues) {
  var projectIssues = yield getProjectIssues(request, projectId);
  for(var i = 0; i < issues.length; i++) {
    yield createIssue(request, projectId, issues[i], projectIssues);
  }
};

var addDefaultMembers = function(users) {
  var members = [];
  for(var i = 0; i < users.length; i++) {
    members.push(users[i].uid);
  }
  return members;
};

var getGitlabGroup = function(gitlabOptions, projectId) {
  if(!gitlabOptions || !gitlabOptions.groups) {
    return null;
  }

  var groups = toArray(gitlabOptions.groups);
  for(var i = 0; i < groups.length; i++) {
    if(groups[i].groupName === projectId) {
      return groups[i];
    }
  }
  return null;
};

var setupProject = function*(browser, url, request, options, users, gitlabOptions) {

  var project = yield getProject(request, options.projectId);
  if(!project) {
    yield createProject(browser, url, options.projectId);
    project = yield getProject(request, options.projectId);
  }

  var gitlabGroup = getGitlabGroup(gitlabOptions, options.projectId);
  if(gitlabGroup) {
    yield createRepositories(browser, url, options.projectId, toArray(gitlabGroup.projects));
  }

  var members = toArray(options.members || addDefaultMembers(users));
  if(members.length > 0) {
    yield addProjectMembers(request, options.projectId, members);
  }

  if(options.issues) {
    yield createIssues(request, project.id, toArray(options.issues));
  }
};

var setupProjects = function*(browser, url, request, projects, users, gitlabOptions) {
  for(var i = 0; i < projects.length; i++) {
    yield setupProject(browser, url, request, projects[i], users, gitlabOptions);
  }
};


var updateUserLanguage = function*(browser, url, user) {
  yield browser.url(url + '/my/account')
    .save('redmine-before-updateUserLanguage-' + user)
    .selectByIndex('#user_language', 0)
    .pause(2000)
    .save('redmine-doing-updateUserLanguage-' + user)
    .submitForm('#my_account_form')
    .save('redmine-after-updateUserLanguage-' + user);
};

var addUsers = function*(browser, url, users) {
  for(var i = 0; i < users.length; i++) {
    yield login(browser, url, users[i].uid, users[i].userPassword);
    yield updateUserLanguage(browser, url, users[i].uid);
    yield logout(browser, users[i].uid);
  }
};

var setupGitLab = function*(browser, url, groupName, project) {
  var projectName = project.projectName;
  var id = groupName + '_' + projectName;

  yield browser.url(url + '/' + groupName + '/' + projectName + '/services')
    .save('redmine-before-setupGitLab-' + id)
    .url(url + '/' + groupName + '/' + projectName + '/services/redmine/edit')
    .save('redmine-before-setupGitLab-' + id);

  var isSelected = yield browser.isSelected('#service_active');
  if (!isSelected) {
    yield browser.click('#service_active');
  }

  yield browser
    .setValue('#service_project_url', process.env.REDMINE_URL + '/projects/' + groupName)
    .setValue('#service_issues_url', process.env.REDMINE_URL + '/issues/:id')
    .setValue('#service_new_issue_url', process.env.REDMINE_URL + '/projects/' + groupName + '/issues/new')
    .save('redmine-doing-setupGitLab-' + id)
    .submitForm('#edit_service')
    .save('redmine-after-setupGitLab-' + id);
};

var setupGitLabForProjects = function*(browser, url, groupName, projects) {
  for(var i = 0; i < projects.length; i++) {
    yield setupGitLab(browser, url, groupName, projects[i]);
  }
};

var getRedmineProject = function(options, groupName) {
  if(!options || !options.projects) {
    return null;
  }

  var projects = toArray(options.projects);
  for(var i = 0; i < projects.length; i++) {
    if(projects[i].projectId === groupName) {
      return projects[i];
    }
  }
  return null;
};

var setupGitLabForGroups = function*(browser, url, groups, options) {
  for(var i = 0; i < groups.length; i++) {
    var groupName = groups[i].groupName;
    var redmineProject = getRedmineProject(options, groupName);
    if(redmineProject) {
      var projects = toArray(groups[i].projects);
      yield setupGitLabForProjects(browser, url, groupName, projects);
    }
  }
};

var updateProfile = function*(browser, url) {
  yield browser.url(url + '/my/account')
    .save('redmine-before-updateProfile')
    .setValue('#user_mail', process.env.ADMIN_MAIL_ADDRESS)
    .save('redmine-doing-updateProfile')
    .submitForm('#my_account_form')
    .save('redmine-after-updateProfile');
};

module.exports = {
  addDefaults: function(options) {
    options.redmine             = options.redmine             || {};
    options.redmine.url         = options.redmine.url         || 'http://redmine.' + options.pocci.domain;
    options.redmine.dbUser      = options.redmine.dbUser      || 'redmine';
    options.redmine.dbPassword  = options.redmine.dbPassword  || util.getRandomString();
    options.redmine.dbName      = options.redmine.dbName      || 'redmine_production';
    options.redmine.smtpEnabled = options.redmine.smtpEnabled || 'false';
    options.redmine.smtpDomain  = options.redmine.smtpDomain  || options.pocci.domain;
    options.redmine.smtpHost    = options.redmine.smtpHost    || 'smtp.' + options.pocci.domain;
    options.redmine.smtpPort    = options.redmine.smtpPort    || '25';
    options.redmine.mailAddress = options.redmine.mailAddress || options.pocci.adminMailAddress;
    // options.redmine.users = options.redmine.users;
    // options.redmine.projects = options.redmine.projects;
  },
  addEnvironment: function(options, environment) {
    var url = parse(options.redmine.url);
    environment.REDMINE_URL           = util.getHref(url);            // redmine.js
    environment.REDMINE_PROTOCOL      = url.protocol;
    environment.REDMINE_HOST          = url.hostname;
    environment.REDMINE_PORT          = util.getPort(url);
    environment.REDMINE_DB_USER       = options.redmine.dbUser;       // sameersbn/postgresql (redminedb)
    environment.REDMINE_DB_PASS       = options.redmine.dbPassword;   // sameersbn/postgresql (redminedb)
    environment.REDMINE_DB_NAME       = options.redmine.dbName;       // sameersbn/postgresql (redminedb)
    environment.REDMINE_SMTP_ENABLED  = options.redmine.smtpEnabled;  // sameersbn/redmine
    environment.REDMINE_SMTP_DOMAIN   = options.redmine.smtpDomain;   // sameersbn/redmine
    environment.REDMINE_SMTP_HOST     = options.redmine.smtpHost;     // sameersbn/redmine
    environment.REDMINE_SMTP_PORT     = options.redmine.smtpPort;     // sameersbn/redmine
    environment.REDMINE_MAIL_ADDRESS  = options.redmine.mailAddress;  // redmine.js
  },
  setup: function*(browser, options) {
    var url = process.env.REDMINE_URL;
    var redmineOptions = options.redmine || {};
    var userOptions = options.user || {};
    var gitlabOptions = options.gitlab || {};
    var isEnabledAuth = process.env.ALL_SERVICES.indexOf('user') > -1;
    var users = (isEnabledAuth)? toArray(redmineOptions.users || userOptions.users) : [];

    yield loginByAdmin(browser, url);
    yield updateProfile(browser, url);
    yield loadDefaultConfiguration(browser, url);
    yield enableWebService(browser, url);
    if(isEnabledAuth) {
      yield enableLdap(browser, url);
    }

    yield logout(browser, 'admin');
    if(users.length > 0) {
      yield addUsers(browser, url, users);
    }

    if(redmineOptions.projects) {
      yield loginByAdmin(browser, url);
      this.request = yield createRequest(browser, url);
      yield setupProjects(browser, url, this.request, toArray(redmineOptions.projects), users, gitlabOptions);
      var gitlabUrl = process.env.GITLAB_URL;
      yield gitlab.loginByAdmin(browser, gitlabUrl);
      yield setupGitLabForGroups(browser, gitlabUrl, toArray(gitlabOptions.groups), redmineOptions);
      yield gitlab.logout(browser);
    }
  },
  login: login,
  loginByAdmin: loginByAdmin,
  logout: logout,
  createRequest: createRequest
};
