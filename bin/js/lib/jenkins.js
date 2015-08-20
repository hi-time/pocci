'use strict';
var fs = require('fs');
var thunkify = require('thunkify');
var jenkinsLib = require('jenkins');
var path = require('path');
var gitlab = require('./gitlab.js');
var ldap = require('./ldap.js');
var ldapDefaults = ldap.defaults;
var util = require('./util.js');
var version = require('./jenkins-slaves-version.json');

var registerGitLab = function*(browser, url, job) {
  var jenkinsJobUrl = process.env.JENKINS_URL + '/project/' + job.jobName;

  browser.url(url + '/services');
  yield browser.yieldable.save('jenkins-before-registerGitLab-1');

  browser.url(url + '/services/gitlab_ci/edit');
  yield browser.yieldable.save('jenkins-before-registerGitLab-1');

  browser
    .setValue('#service_token', 'jenkins')
    .setValue('#service_project_url', jenkinsJobUrl);

  var isSelected = (yield browser.yieldable.isSelected('#service_active'))[0];
  if (!isSelected) {
    yield browser.yieldable.click('#service_active');
  }

  yield browser.yieldable.save('jenkins-doing-registerGitLab-1');
  browser.submitForm('#edit_service');
  yield browser.yieldable.save('jenkins-after-registerGitLab-1');

  browser.url(url + '/hooks');
  yield browser.yieldable.save('jenkins-after-registerGitLab-2');

  browser.setValue('#hook_url', jenkinsJobUrl);

  isSelected = (yield browser.yieldable.isSelected('#hook_push_events'))[0];
  if (isSelected) {
    yield browser.yieldable.click('#hook_push_events');
  }

  isSelected = (yield browser.yieldable.isSelected('#hook_merge_requests_events'))[0];
  if (!isSelected) {
    yield browser.yieldable.click('#hook_merge_requests_events');
  }

  yield browser.yieldable.save('jenkins-doing-registerGitLab-2');
  browser.submitForm('#new_hook');
  yield browser.yieldable.save('jenkins-after-registerGitLab-2');
};

var createJob = function*(browser, jenkins, job, gitlabUrl) {
  var toUrl = function(path) {
    return util.getURL(gitlabUrl, null, path);
  };

  var destroy = thunkify(jenkins.job.destroy.bind(jenkins.job));
  var create = thunkify(jenkins.job.create.bind(jenkins.job));
  var replaceRepositoryUrl = function(text, repositoryUrl) {
    return text.replace('${REPOSITORY_URL}', repositoryUrl);
  };

  try {
    yield destroy(job.jobName);
  } catch(e) {
    // ignore
  }

  var configXml = fs.readFileSync(job.configXmlFilePath, 'utf8');
  var repositoryUrl = toUrl(job.repositoryPath);
  yield create(job.jobName, replaceRepositoryUrl(configXml, repositoryUrl));

  if(configXml.indexOf('GitLabPushTrigger') > -1) {
    yield registerGitLab(browser, repositoryUrl.slice(0, -4), job);
  }
};

var createJobs = function*(browser, jenkins, repositories, gitlabUrl) {
  var normalizeJob = function(repo) {
    var configXmlFilePath = path.resolve(repo.localPath, 'jenkins-config.xml');
    if(fs.existsSync(configXmlFilePath)) {
      return {
        jobName:            path.basename(repo.localPath),
        configXmlFilePath:  configXmlFilePath,
        repositoryPath:     repo.remotePath
      };
    } else {
      return null;
    }
  };

  var normalizeJobs = function(repositories) {
    var nomalizedJobs = [];
    for(var i = 0; i < repositories.length; i++) {
      var job = normalizeJob(repositories[i]);
      if(job) {
        nomalizedJobs.push(job);
      }
    }
    return nomalizedJobs;
  };

  var jobs = normalizeJobs(repositories);
  for(var i = 0; i < jobs.length; i++) {
    yield createJob(browser, jenkins, jobs[i], gitlabUrl);
  }
};

var writeNodeConf = function(node, secret) {
  var templateFilePath = path.resolve(__dirname, 'jenkins-slaves-template.yml');
  var text = fs.readFileSync(templateFilePath, 'utf8')
              .replace(/__NAME/g, node)
              .replace(/__VERSION/g, version[node])
              .replace(/__SECRET/g, secret);
  fs.appendFileSync('./config/jenkins-slaves.yml.template', text);
};

var createNode = function*(jenkins, nodeName, ldapOptions) {
  var destroy = thunkify(jenkins.node.destroy.bind(jenkins.node));
  var create = thunkify(jenkins.node.create.bind(jenkins.node));

  try {
    yield destroy(nodeName);
  } catch(e) {
    // ignore
  }

  var options = {
    name: nodeName,
    remoteFS: '/var/jenkins_home',
    numExecutors: 1,
    exclusive: false
  };

  yield create(options);
  if(!ldapOptions) {
    writeNodeConf(nodeName, '');
  }
};

var createNodes = function*(jenkins, nodes, ldapOptions) {
  nodes = util.toArray(nodes);
  for(var i = 0; i < nodes.length; i++) {
    yield createNode(jenkins, nodes[i], ldapOptions);
  }
};

var enableLdap = function*(browser, url, ldapOptions, ldapUrl, user) {
  var enableSecurity = function*() {
    var isSelected = (yield browser.yieldable.isSelected(useSecuritySelector))[0];
    if (!isSelected) {
      yield browser.yieldable.save('jenkins-doing-enableSecurity-1');
      yield browser.yieldable.click('input[type="checkbox"][name="_.useSecurity"]');
    }

      yield browser.yieldable.save('jenkins-doing-enableSecurity-2');
    yield browser.yieldable.click('#radio-block-2');
      yield browser.yieldable.save('jenkins-doing-enableSecurity-3');
    yield browser.yieldable.click('#yui-gen1-button');

    var uid = ldapOptions.attrLogin || ldapDefaults.attrLogin;
    browser
      .setValue('input[type="text"][name="_.server"]', ldapUrl)
      .setValue('input[type="text"][name="_.rootDN"]', ldapOptions.baseDn || ldapDefaults.baseDn)
      .setValue('input[type="text"][name="_.userSearch"]', uid + '={0}')
      .setValue('input[type="text"][name="_.managerDN"]', ldapOptions.bindDn || ldapDefaults.bindDn)
      .setValue('input[type="password"][name="_.managerPasswordSecret"]', ldapOptions.bindPassword || ldapDefaults.bindPassword)
      .setValue('input[type="text"][name="_.displayNameAttributeName"]', ldapOptions.attrLogin || ldapDefaults.attrLogin);

    yield browser.yieldable.save('jenkins-doing-enableSecurity-4');
    yield browser.yieldable.click('#yui-gen6-button');
    yield browser.yieldable.save('jenkins-after-enableSecurity');
  };

  browser.url(url + '/configureSecurity/');
  yield browser.yieldable.save('jenkins-before-enableSecurity');

  var useSecuritySelector = 'input[type="checkbox"][name="_.useSecurity"]';
  var isDisabledSecurity = (yield browser.yieldable.isExisting(useSecuritySelector))[0];

  if(isDisabledSecurity) {
    yield enableSecurity();
  }

  var loginUser = util.getUser(user, ldapOptions.users);
  browser.url(url + '/login');
  yield browser.yieldable.save('jenkins-before-login-by-' + loginUser.uid);

  browser
    .setValue('#j_username', loginUser.uid)
    .setValue('input[type="password"][name="j_password"]', loginUser.userPassword);
  yield browser.yieldable.save('jenkins-doing-login-by-' + loginUser.uid);

  yield browser.yieldable.click('button');
  yield browser.yieldable.save('jenkins-after-login-by-' + loginUser.uid);

  if(isDisabledSecurity) {
    browser.url(url + '/configureSecurity/');
    yield browser.yieldable.save('jenkins-before-configureSecurity');

    yield browser.yieldable.click('#radio-block-8');
    yield browser.yieldable.save('jenkins-doing-configureSecurity-1');
    yield browser.yieldable.click('input[type="checkbox"][name="_.masterToSlaveAccessControl"]');
    yield browser.yieldable.save('jenkins-doing-configureSecurity-2');
    yield browser.yieldable.click('#yui-gen6-button');
    yield browser.yieldable.save('jenkins-after-configureSecurity');
  }
};

var saveSecret = function*(browser, url, node) {
  browser.url(url + '/computer/' + node);
  yield browser.yieldable.save('jenkins-saveSecret');

  var text = (yield browser.yieldable.getText('pre'))[0];
  var secret = text.replace(/.*-secret/,'-secret');
  writeNodeConf(node, secret);
};

var saveSecrets = function*(browser, url, nodes) {
  nodes = util.toArray(nodes);
  for(var i = 0; i < nodes.length; i++) {
    yield saveSecret(browser, url, nodes[i]);
  }
};

var configureGitLab = function*(browser, url, gitlabUrl, apiToken) {
  browser.url(url + '/configure');
  yield browser.yieldable.save('jenkins-before-configureGitLab');
  browser
    .setValue('input[type="text"][name="_.gitlabHostUrl"]', gitlabUrl)
    .setValue('input[type="text"][name="_.gitlabApiToken"]', apiToken);
  yield browser.yieldable.save('jenkins-doing-configureGitLab');
  yield browser.yieldable.click('#yui-gen17-button');
  yield browser.yieldable.save('jenkins-after-configureGitLab');
};

module.exports = {
  setup: function*(browser, options, ldapOptions, repositories) {
    var url = process.env.JENKINS_URL;
    var getJenkins = function() {
      if(ldapOptions) {
        var loginUser = util.getUser(options.user, ldapOptions.users);
        return jenkinsLib(util.getURL(url, loginUser));
      } else {
        return jenkinsLib(url);
      }
    };

    var jenkins = getJenkins();
    if(options.nodes) {
      yield createNodes(jenkins, options.nodes, ldapOptions);
    }

    if(ldapOptions) {
      var ldapUrl = options.ldapUrl || ldap.url(ldapOptions);
      yield enableLdap(browser, url, ldapOptions, ldapUrl, options.user);
    }

    if(options.nodes) {
      yield saveSecrets(browser, url, options.nodes);
    }

    var gitlabUrl = process.env.GITLAB_URL;
    if(gitlabUrl) {
      yield gitlab.loginByAdmin(browser, gitlabUrl);
      var apiToken = yield gitlab.getPrivateToken(browser, gitlabUrl);
      yield configureGitLab(browser, url, gitlabUrl, apiToken);
      yield createJobs(browser, jenkins, repositories, gitlabUrl);
      yield gitlab.logout(browser);
    }
  }
};
