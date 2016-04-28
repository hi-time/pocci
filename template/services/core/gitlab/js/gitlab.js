/*jshint camelcase: false */
'use strict';
var fs = require('fs');
var path = require('path');
var server = require('co-request');
var git = require('pocci/git.js');
var toArray = require('pocci/util.js').toArray;
var assertStatus = require('pocci/util.js').assertStatus;
var util = require('pocci/util.js');
var workspace = require('pocci/workspace.js');
var parse = require('url').parse;
var adminPassword = process.env.GITLAB_ROOT_PASSWORD;
var firstLogin = true;

var logout = function*(browser) {
  browser.url(process.env.GITLAB_URL + '/profile');
  yield browser.save('gitlab-before-logout');
  yield browser.click('a[href="/users/sign_out"]');
  yield browser.save('gitlab-after-logout');
};

var login = function*(browser, url, user, password) {
  browser.url(url + '/users/sign_in');
  yield browser.save('gitlab-before-login-by-' + user);

  browser
    .setValue('#username', user)
    .setValue('#password', password);
  yield browser.save('gitlab-doing-login-by-' + user);

  yield browser.submitForm('#new_ldap_user');
  yield browser.save('gitlab-after-login-by-' + user);
};

var createAvatarImage = function*(user) {
    var fileName = './config/avatar/' + user.uid + path.extname(user.labeledURI);
    try {
      var parsedUrl = parse(user.labeledURI);
      if(parsedUrl.protocol === 'file:') {
        var src = path.join('./config', parsedUrl.pathname);
        fs.createReadStream(src).pipe(fs.createWriteStream(fileName));
      } else {
        var res = yield server({
          url: user.labeledURI,
          encoding : null
        });
        fs.writeFileSync(fileName, res.body, {encoding:'binary'});
      }
    } catch(e) {
      console.log('WARNING: cannot download: ' + user.labeledURI + ' --> ' + fileName);
      console.log(e);
    }
};

var updateProfileSettings = function*(browser, url, user) {
  browser.url(url + '/profile');
  yield browser.save('gitlab-before-updateProfileSettings-of-' + user.uid);
  if(user.displayName) {
    browser.setValue('#user_name', user.displayName);
  }
  yield browser.save('gitlab-doing-updateProfileSettings-of-' + user.uid);
  yield browser.submitForm('form.edit-user');
  yield browser.save('gitlab-after-updateProfileSettings-of-' + user.uid);

  if(user.labeledURI) {
    yield createAvatarImage(user);
  }
};

var newPassword = function*(browser, url, password) {
  browser.url(url + '/profile/password/new');
  yield browser.save('gitlab-before-newPassword');

  browser
    .setValue('#user_current_password', password)
    .setValue('#user_password', password)
    .setValue('#user_password_confirmation', password);
  yield browser.save('gitlab-doing-newPassword');

  browser.submitForm('#edit_user_1');
  yield browser.save('gitlab-after-newPassword');
};


var loginByAdmin = function*(browser, url) {
  browser.url(url + '/users/sign_in');
  yield browser.save('gitlab-before-loginByAdmin');

  yield browser.click('a[href="#tab-signin"]');
  yield browser.save('gitlab-loginByAdmin-siginin-tab-clicked');

  browser
    .setValue('#user_login', 'root')
    .setValue('#user_password', adminPassword);
  yield browser.save('gitlab-doing-loginByAdmin');

  browser.submitForm('#new_user');
  yield browser.save('gitlab-after-loginByAdmin');
};

var firstLoginByAdmin = function*(browser, url) {
  yield loginByAdmin(browser, url);
  if(firstLogin) {
    firstLogin = false;
    yield newPassword(browser, url, adminPassword);
    yield loginByAdmin(browser, url);
  }
};

var getPrivateToken = function*(browser, url) {
  browser.url(url + '/profile/account');
  yield browser.save('gitlab-getPrivateToken');
  return yield browser.getValue('#token');
};

var createRequest = function*(browser, url) {
  var key = yield getPrivateToken(browser, url);

  return function(path, body) {
    var request =  {
      url: url + '/api/v3' + path,
      json: true,
      headers: {
        'PRIVATE-TOKEN': key
      }
    };
    if(body) {
      request.body = body;
    }
    return request;
  };
};

var getProjectId = function*(request, projectName) {
  var names = projectName.split('/');
  var response = yield server.get(request('/projects/search/' + names[1] + '?per_page=100'));
  assertStatus(response, 'response.statusCode < 300');
  for(var i = 0; i < response.body.length; i++) {
    if(response.body[i].path_with_namespace === projectName) {
      return response.body[i].id;
    }
  }
  return null;
};

var createProject = function*(request, projectName, groupId) {
  var response = yield server.post(request('/projects', {
    name : projectName, 
    'public' : 'true', 
    'namespace_id' : groupId
  }));
  assertStatus(response, 'response.statusCode === 201');
  return response.body.id;
};

var addGroupMember = function*(request, groupId, userId) {
  var response = yield server.post(
    request(
      '/groups/' + groupId + '/members', 
      {'user_id': userId, 'access_level': 50}
    )
  );
  assertStatus(response, 'response.statusCode === 201 || response.statusCode === 409');
};

var getUserMap = function*(request) {
  var response = yield server.get(request('/users'));
  var users = response.body;
  var userMap = {};
  for(var i = 0; i < users.length; i++) {
    userMap[users[i].username] = users[i].id;
  }
  return userMap;
};

var toUserIds = function*(request, usernames) {
  var userMap = yield getUserMap(request);
  var userIds = [];
  for(var i = 0; i < usernames.length; i++) {
    var name = usernames[i];
    var id = userMap[name];
    if(id) {
      userIds.push(id);
    } else {
      throw new Error('cannot find user : ' + name);
    }
  }
  return userIds;
};

var addGroupMembers = function*(request, groupId, members) {
  var memberIds = yield toUserIds(request, members);
  for(var i = 0; i < members.length; i++) {
    yield addGroupMember(request, groupId, memberIds[i]);
  }
};

var addDefaultMembers = function(users) {
  var members = [];
  for(var i = 0; i < users.length; i++) {
    members.push(users[i].uid);
  }
  return members;
};

var createIssue = function*(request, projectId, issueOrTitle) {

  var getIssueId = function*(title) {
    var response = yield server.get(request('/projects/' + projectId + '/issues'));
    if(!response.body) {
      return null;
    }

    for(var i = 0; i < response.body.length; i++) {
      if(response.body[i].title === title) {
        return response.body[i].id;
      }
    }
    return null;
  };

  var postIssue = function*(id, issue) {
    var response = 
      yield server.post(request('/projects/' + projectId + '/issues', issue));
    assertStatus(response, 'response.statusCode === 201');
  };

  var putIssue = function*(id, issue) {
    var response = 
      yield server.put(request('/projects/' + projectId + '/issues/' + id, issue));
    assertStatus(response, 'response.statusCode < 300');
  };

  var newIssue = function() {
    if(typeof issueOrTitle === 'object') {
      return issueOrTitle;
    } else {
      return  {title : '' + issueOrTitle};
    }
  };

  var issue = newIssue();
  var id = yield getIssueId(issue.title);
  if(id) {
    yield putIssue(id, issue);
  } else {
    yield postIssue(id, issue);
  }
};

var createIssues = function*(request, projectId, issues) {
  for(var i = 0; i < issues.length; i++) {
    yield createIssue(request, projectId, issues[i]);
  }
};

var setupProject = function*(request, options, groupId, repositories, groupName) {
  var projectName = options.projectName;
  var projectId = yield getProjectId(request, groupName + '/' + projectName);
  if(!projectId) {
    projectId = yield createProject(request, projectName, groupId);
  }

  var localPath = './config/code/' + groupName + '/' + projectName;
  if(fs.existsSync(localPath)) {
    var repository = {
      localPath: localPath,
      commitMessage: options.commitMessage || 'Initial commit',
      remotePath: '/' + groupName + '/' + projectName + '.git'
    };
    repositories.push(repository);
  }

  if(options.issues) {
    yield createIssues(request, projectId, toArray(options.issues));
  }
};

var setupProjects = function*(request, projects, groupId, repositories, groupName) {
  for(var i = 0; i < projects.length; i++) {
    yield setupProject(request, projects[i], groupId, repositories, groupName);
  }
};

var getGroupId = function*(request, groupName) {
  var response = yield server.get(request('/groups?search=' + groupName));
  assertStatus(response, 'response.statusCode < 300');
  return (response.body.length === 0)? null : response.body[0].id;
};

var createGroup = function*(request, groupName) {
  var response = yield server.post(request('/groups', {name : groupName, path : groupName}));
  assertStatus(response, 'response.statusCode === 201');
  return response.body.id;
};

var setupGroup = function*(request, options, users, repositories) {
  var groupName = options.groupName;
  var groupId = yield getGroupId(request, groupName);
  if(!groupId) {
    groupId = yield createGroup(request, groupName);
  }
  var members = options.members || addDefaultMembers(users);
  if(members) {
    yield addGroupMembers(request, groupId, members);
  }

  if(options.projects) {
    yield setupProjects(request, toArray(options.projects), groupId, repositories, groupName);
  }
};

var setupGroups = function*(request, groups, users, repositories) {
  for(var i = 0; i < groups.length; i++) {
    yield setupGroup(request, groups[i], users, repositories);
  }
};

var cleanAvatarImages = function() {
  var avatarDir = './config/avatar';
  if(fs.existsSync(avatarDir)) {
    fs.readdirSync(avatarDir).forEach(function(file) {
      fs.unlinkSync(path.join(avatarDir, file));
    });
  } else {
    fs.mkdirSync(avatarDir);
  }
};

var addUsers = function*(browser, url, users) {
  cleanAvatarImages();
  for(var i = 0; i < users.length; i++) {
    yield login(browser, url, users[i].uid, users[i].userPassword);
    yield updateProfileSettings(browser, url, users[i]);
    yield logout(browser);
  }
};

var getGitlabTimezone = function(timezone) {
  if(timezone) {
    return timezone.replace(/.*\//,'');
  } else {
    return '';
  }
};

var setupRunners = function*(browser, url, runners) {
  browser.url(url + '/admin/runners');
  yield browser.save('gitlab-getToken');
  var token = yield browser.getText('code');

  for(var i = 0; i < runners.length; i++) {
    workspace.writeConfiguration('./config/services/core/gitlab/runner', runners[i], token);
  }
};

module.exports = {
  addDefaults: function(options) {
    options.gitlab                      = options.gitlab      || {};
    options.gitlab.url                  = options.gitlab.url  || 'http://gitlab.' + options.pocci.domain;
    options.gitlab.adminPassword        = options.gitlab.adminPassword        || '5iveL!fe';
    options.gitlab.ldapEnabled          = options.gitlab.ldapEnabled          || 'true';
    options.gitlab.ldapMethod           = options.gitlab.ldapMethod           || 'plain';
    options.gitlab.ldapActiveDirectory  = options.gitlab.ldapActiveDirectory  || 'false';
    options.gitlab.dbUser               = options.gitlab.dbUser               || 'gitlab';
    options.gitlab.dbPassword           = options.gitlab.dbPassword           || util.getRandomString();
    options.gitlab.dbName               = options.gitlab.dbName               || 'gitlabhq_production';
    options.gitlab.sshPort              = options.gitlab.sshPort              || '10022';
    options.gitlab.smtpEnabled          = options.gitlab.smtpEnabled          || 'false';
    options.gitlab.smtpDomain           = options.gitlab.smtpDomain           || options.pocci.domain;
    options.gitlab.smtpHost             = options.gitlab.smtpHost             || 'smtp.' + options.pocci.domain;
    options.gitlab.smtpPort             = options.gitlab.smtpPort             || '25';
    options.gitlab.mailAddress          = options.gitlab.mailAddress          || options.pocci.adminMailAddress;
    options.gitlab.timezone             = options.gitlab.timezone             || getGitlabTimezone(options.pocci.environment.TZ);
    options.gitlab.secretsDbKeyBase     = options.gitlab.secretsDbKeyBase     || util.getRandomString();
    // options.gitlab.users = options.gitlab.users;
    // options.gitlab.groups = options.gitlab.groups;
  },
  addEnvironment: function(options, environment) {
    var url = parse(options.gitlab.url);
    environment.GITLAB_URL            = util.getHref(url);                          // gitlab.js, jenkins.js, kanban.js, redmine.js, git.js
    environment.GITLAB_PROTOCOL       = url.protocol;
    environment.GITLAB_HOST           = url.hostname;                               // sameersbn/gitlab
    environment.GITLAB_PORT           = util.getPort(url);
    environment.GITLAB_LDAP_ENABLED   = options.gitlab.ldapEnabled;                 // sameersbn/gitlab
    environment.GITLAB_LDAP_METHOD    = options.gitlab.ldapMethod;                  // sameersbn/gitlab
    environment.GITLAB_LDAP_ACTIVE_DIRECTORY = options.gitlab.ldapActiveDirectory;  // sameersbn/gitlab
    environment.GITLAB_ROOT_PASSWORD  = options.gitlab.adminPassword;               // sameersbn/gitlab
    environment.GITLAB_SSH_PORT       = options.gitlab.sshPort;                     // sameersbn/gitlab
    environment.GITLAB_DB_USER        = options.gitlab.dbUser;                      // sameersbn/postgresql (gitlabdb)
    environment.GITLAB_DB_PASS        = options.gitlab.dbPassword;                  // sameersbn/postgresql (gitlabdb)
    environment.GITLAB_DB_NAME        = options.gitlab.dbName;                      // sameersbn/postgresql (gitlabdb)
    environment.LDAP_PASS             = options.ldap.bindPassword;                  // sameersbn/gitlab
    environment.LDAP_BASE             = options.ldap.baseDn;                        // sameersbn/gitlab
    environment.GITLAB_SMTP_ENABLED   = options.gitlab.smtpEnabled;                 // sameersbn/gitlab
    environment.GITLAB_SMTP_DOMAIN    = options.gitlab.smtpDomain;                  // sameersbn/gitlab
    environment.GITLAB_SMTP_HOST      = options.gitlab.smtpHost;                    // sameersbn/gitlab
    environment.GITLAB_SMTP_PORT      = options.gitlab.smtpPort;                    // sameersbn/gitlab
    environment.GITLAB_MAIL_ADDRESS   = options.gitlab.mailAddress;                 // sameersbn/gitlab
    environment.GITLAB_TIMEZONE       = options.gitlab.timezone;                    // sameersbn/gitlab
    environment.GITLAB_SECRETS_DB_KEY_BASE = options.gitlab.secretsDbKeyBase;       // sameersbn/gitlab
  },
  setup: function*(browser, options) {
    var url = process.env.GITLAB_URL;
    var repositories = options.repositories = options.repositories || [];
    var gitlabOptions = options.gitlab || {};
    var userOptions = options.user || {};

    var users = toArray(gitlabOptions.users || userOptions.users);
    if(users) {
      yield addUsers(browser, url, users);
    }

    if(gitlabOptions.groups) {
      yield firstLoginByAdmin(browser, url);
      this.request = yield createRequest(browser, url);
      var groups = toArray(gitlabOptions.groups);
      yield setupGroups(this.request, groups, users, repositories);
      yield logout(browser);
    }

    if(repositories && repositories.length > 0) {
      console.log('*** Import codes to Git repository...');
      yield git.handleSetup(browser, options);
    }

    if(gitlabOptions.runners) {
      yield firstLoginByAdmin(browser, url);
      var runners = workspace.normalize(gitlabOptions.runners);
      yield setupRunners(browser, url, runners);
      yield logout(browser);
    }
  },
  getPrivateToken: getPrivateToken,
  loginByAdmin: loginByAdmin,
  login: login,
  logout: logout,
  getProjectId: getProjectId,
  createRequest: createRequest
};
