/*jshint camelcase: false */
'use strict';
var fs = require('fs');

var assertStatus = require('pocci/util.js').assertStatus;
var toArray = require('pocci/util.js').toArray;
var getAvatarImageFileName = require('pocci/user.js').getAvatarImageFileName;

var parse = require('url').parse;
var util = require('pocci/util.js');
var server = require('co-request');
var gitlab = require('pocci/gitlab.js');
var smtp = require('pocci/smtp.js');


var createRequest = function*(url, loginUser) {
  var apiUrl = url + '/api/v1';
  var response = yield server.post({
    url: apiUrl + '/auth',
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      type: 'ldap', 
      username: loginUser.uid, 
      password: loginUser.userPassword
    }
  });

  assertStatus(response, 'response.statusCode < 300');

  return function(path, body, formData) {
    var request = {
      url: apiUrl + path,
      json: true,
      headers: {
        'Authorization': 'Bearer ' + response.body.auth_token,
        'Content-Type': 'application/json'
      }
    };
    if(body) {
      request.body = body;
    }
    if(formData) {
      request.formData = formData;
    }
    return request;
  };
};

var addUsers = function*(url, users) {
  for(var i = 0; i < users.length; i++) {
    var user = users[i];
    var request = yield createRequest(url, user);
    var fileName = getAvatarImageFileName(user);

    try {
      fs.statSync(fileName);
    } catch(e) {
      console.log(e);
      return;
    }

    var response = yield server.post(request('/users/change_avatar', null, {
      avatar: fs.createReadStream(fileName)
    }));
    assertStatus(response, 'response.statusCode < 300');
  }
};


var createProject = function*(request, options) {
  var response = yield server.post(request('/projects', options));
  assertStatus(response, 'response.statusCode < 300');
};

var getProject = function*(request, options, loginUser) {
  return yield server.get(request('/projects/by_slug?slug=' + loginUser.uid + '-' + options.name));
};

var addProjectMembers = function*(request, id, members, owner) {
  var memberships = [];
  var role = owner.role;
  for(var i = 0; i < members.length; i++) {
    if(owner.username !== members[i].uid) {
      memberships.push({
        role_id: role,
        username: members[i].mail
      });
    }
  }

  if(memberships.length > 0) {
    var response = yield server.post(request('/memberships/bulk_create', {
      project_id: id,
      bulk_memberships: memberships
    }));
    assertStatus(response, 'response.statusCode < 300');
  }
};

var updateGitLabSetting = function*(browser, url, apiToken, taiga) {

  yield browser.url(url + '/settings/integrations')
    .save('taiga-before-updateGitLabSetting')
    .setValue('#hook_url', taiga.webhooks_url);

  var isSelected = yield browser.isSelected('#hook_push_events');
  if (!isSelected) {
    yield browser.click('#hook_push_events');
  }

  isSelected = yield browser.isSelected('#hook_note_events');
  if (!isSelected) {
    yield browser.click('#hook_note_events');
  }

  isSelected = yield browser.isSelected('#hook_issues_events');
  if (!isSelected) {
    yield browser.click('#hook_issues_events');
  }

  yield browser.save('taiga-doing-updateGitLabSetting')
    .submitForm('#new_hook')
    .save('taiga-after-updateGitLabSetting');
};

var createProjectIfNotExists = function*(request, options, loginUser) {
  var response = yield getProject(request, options, loginUser);
  if(response.statusCode >= 300) {
    yield createProject(request, options);
    response = yield getProject(request, options, loginUser);
    assertStatus(response, 'response.statusCode < 300');
  }
  return response.body;
};

var addDefaultMembers = function(users) {
  var members = [];
  for(var i = 0; i < users.length; i++) {
    members.push(users[i]);
  }
  return members;
};

var getGitlabProjects = function(groupName, gitlabGroups) {
  for(var i = 0; i < gitlabGroups.length; i++) {
    var group = gitlabGroups[i];
    if(groupName === group.groupName) {
      return group.projects;
    }
  }
  return null;
};

var setupProject = function*(browser, request, options, users, loginUser, gitlabGroups) {
  var project = yield createProjectIfNotExists(request, options, loginUser);
  var owner = project.members[0];
  var members = toArray(options.members || addDefaultMembers(users));
  if(members.length > 0) {
    yield addProjectMembers(request, project.id, members, owner);
  }

  var gitlabProjects = getGitlabProjects(project.name, gitlabGroups);
  if(gitlabProjects) {
    var response = yield server.get(request('/projects/' + project.id + '/modules'));
    var taiga = response.body.gitlab;
  
    var gitlabUrl = process.env.GITLAB_URL;
    yield gitlab.loginAs(browser, gitlabUrl, loginUser);
    var apiToken = yield gitlab.getPrivateToken(browser, gitlabUrl);
    for(var i = 0; i < gitlabProjects.length; i++) {
      var url = gitlabUrl + '/' + project.name + '/' + gitlabProjects[i].projectName;
      yield updateGitLabSetting(browser, url, apiToken, taiga);
    }
    yield gitlab.logout(browser);
  }
};


var setupProjects = function*(browser, request, projects, users, loginUser, gitlabGroups) {
  for(var i = 0; i < projects.length; i++) {
    yield setupProject(browser, request, projects[i], users, loginUser, gitlabGroups);
  }
};


module.exports = {
  addDefaults: function(options) {
    options.taiga             = options.taiga             || {};
    options.taiga.url         = options.taiga.url         || 'http://taiga.' + options.pocci.domain;
    options.taiga.secretKey   = options.taiga.secretKey   || util.getRandomString();
    options.taiga.dbUser      = options.taiga.dbUser      || 'taiga';
    options.taiga.dbPassword  = options.taiga.dbPassword  || util.getRandomString();
    options.taiga.dbName      = options.taiga.dbName      || 'taiga';
    options.taiga.smtpDomain  = options.taiga.smtpDomain  || smtp.getDomain(options);
    options.taiga.smtpHost    = options.taiga.smtpHost    || smtp.getHost(options);
    options.taiga.smtpPort    = options.taiga.smtpPort    || smtp.getPort(options);
    options.taiga.mailAddress = options.taiga.mailAddress || options.pocci.adminMailAddress;
  },
  addEnvironment: function(options, environment) {
    var url = parse(options.taiga.url);
    environment.TAIGA_URL           = util.getHref(url);
    environment.TAIGA_PROTOCOL      = url.protocol;
    environment.TAIGA_HOST          = url.hostname;
    environment.TAIGA_PORT          = util.getPort(url);
    environment.TAIGA_DB_USER       = options.taiga.dbUser;
    environment.TAIGA_DB_PASS       = options.taiga.dbPassword;
    environment.TAIGA_DB_NAME       = options.taiga.dbName;
    environment.TAIGA_SECRET_KEY    = options.taiga.secretKey;
    environment.TAIGA_SMTP_DOMAIN   = options.taiga.smtpDomain;
    environment.TAIGA_SMTP_HOST     = options.taiga.smtpHost;
    environment.TAIGA_SMTP_PORT     = options.taiga.smtpPort;
    environment.TAIGA_MAIL_ADDRESS  = options.taiga.mailAddress;
  },
  setup: function*(browser, options) {
    var taigaOptions = options.taiga || {};
    var userOptions = options.user || {};
    var isEnabledGitLab = process.env.ALL_SERVICES.indexOf('gitlab') > -1;
    var users = util.toArray(taigaOptions.users || userOptions.users);
    var url = process.env.TAIGA_URL;

    if(users.length > 0) {
      yield addUsers(url, users);
    }

    if(taigaOptions.projects) {
      var gitlabGroups = [];
      if(isEnabledGitLab && options.gitlab) {
        gitlabGroups = options.gitlab.groups;
      }

      var loginUser = util.getUser(taigaOptions.user, users);
      var projects = toArray(taigaOptions.projects);
      this.request = yield createRequest(url, loginUser);
      yield setupProjects(browser, this.request, projects, users, loginUser, gitlabGroups);
    }
  },
  createRequest: createRequest
};
