'use strict';
var fs = require('fs');
var server = require('co-request');
var toArray = require('./util.js').toArray;
var assertStatus = require('./util.js').assertStatus;
var adminPassword = '5iveL!fe';

var logout = function*(browser) {
  yield browser.yieldable.save('gitlab-before-logout');
  browser
    .click('a[href="/users/sign_out"]')
    .pause(1000);
  yield browser.yieldable.save('gitlab-after-logout');
};

var login = function*(browser, url, user, password) {
  browser.url(url + '/users/sign_in');
  yield browser.yieldable.save('gitlab-before-login-by-' + user);

  browser
    .setValue('#username', user)
    .setValue('#password', password);
  yield browser.yieldable.save('gitlab-doing-login-by-' + user);

  browser.submitForm('#new_ldap_user');
  yield browser.yieldable.save('gitlab-after-login-by-' + user);
};

var newPassword = function*(browser, url, password) {
  browser.url(url + '/profile/password/new');
  yield browser.yieldable.save('gitlab-before-newPassword');

  browser
    .setValue('#user_current_password', password)
    .setValue('#user_password', password)
    .setValue('#user_password_confirmation', password);
  yield browser.yieldable.save('gitlab-doing-newPassword');

  browser.submitForm('#edit_user_1');
  yield browser.yieldable.save('gitlab-after-newPassword');
};


var loginByAdmin = function*(browser, url) {
  browser.url(url + '/users/sign_in');
  yield browser.yieldable.save('gitlab-before-loginByAdmin');

  yield browser.yieldable.click('a[href="#tab-signin"]');
  yield browser.yieldable.save('gitlab-loginByAdmin-siginin-tab-clicked');

  browser
    .setValue('#user_login', 'root')
    .setValue('#user_password', adminPassword);
  yield browser.yieldable.save('gitlab-doing-loginByAdmin');

  browser.submitForm('#new_user');
  yield browser.yieldable.save('gitlab-after-loginByAdmin');
};

var firstLoginByAdmin = function*(browser, url) {
  yield loginByAdmin(browser, url);
  yield newPassword(browser, url, adminPassword);
  yield loginByAdmin(browser, url);
};

var getPrivateToken = function*(browser, url) {
  browser.url(url + '/profile/account');
  yield browser.yieldable.save('gitlab-getPrivateToken');
  return (yield browser.yieldable.getValue('#token'))[0];
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
  var response = yield server.get(request('/projects/search/' + projectName));
  assertStatus(response, 'response.statusCode < 300');
  return (response.body.length === 0)? null : response.body[0].id;
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
  var projectId = yield getProjectId(request, projectName);
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

var addUsers = function*(browser, url, users) {
  for(var i = 0; i < users.length; i++) {
    yield login(browser, url, users[i].uid, users[i].userPassword);
    yield logout(browser);
  }
};

var updateNginxConfFile = function(topPage) {
  var file = './config/services/nginx/gitlab.conf';
  var text = fs.readFileSync(file, 'utf8');
  text = text.replace(/__TOP_PAGE/, topPage).replace(/#location/, 'location');
  fs.writeFileSync(file, text);
};

module.exports = {
  setup: function*(browser, options, ldapOptions, repositories) {
    var url = process.env.GITLAB_URL;
    var users = toArray(options.users || ldapOptions.users);

    if(users) {
      yield addUsers(browser, url, users);
    }

    if(options.groups) {
      yield firstLoginByAdmin(browser, url);
      this.request = yield createRequest(browser, url);
      var groups = toArray(options.groups);
      yield setupGroups(this.request, groups, users, repositories);
      yield logout(browser);
    }

    if(options.topPage) {
      updateNginxConfFile(options.topPage);
    }
  },
  getPrivateToken: getPrivateToken,
  loginByAdmin: loginByAdmin,
  logout: logout,
  createRequest: createRequest
};
