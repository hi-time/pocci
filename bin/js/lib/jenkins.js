'use strict';
var fs = require('fs');
var thunkify = require('thunkify');
var jenkinsLib = require('jenkins');
var path = require('path');
var gitlab = require('./gitlab.js');
var util = require('./util.js');
var parse = require('url').parse;
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

var createJobs = function*(browser, jenkins, jobNames, gitlabUrl) {
  var toJob = function(jobName) {
    if(typeof jobName === 'object') {
      return jobName;
    } else {
      return {
        jobName:            path.basename(jobName),
        configXmlFilePath:  path.resolve('./config/code', jobName, 'jenkins-config.xml'),
        repositoryPath:     '/' + jobName + '.git'
      };
    }
  };

  var toJobs = function(jobNames) {
    var nomalizedJobs = [];
    for(var i = 0; i < jobNames.length; i++) {
      var job = toJob(jobNames[i]);
      nomalizedJobs.push(job);
    }
    return nomalizedJobs;
  };

  var jobs = toJobs(jobNames);
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

var createNode = function*(jenkins, nodeName) {
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
};

var createNodes = function*(jenkins, nodes) {
  nodes = util.toArray(nodes);
  for(var i = 0; i < nodes.length; i++) {
    yield createNode(jenkins, nodes[i]);
  }
};

var enableLdap = function*(browser, url, loginUser) {
  var enableSecurity = function*() {
    yield browser.yieldable.save('jenkins-doing-enableSecurity-1');
    yield browser.yieldable.click('input[type="checkbox"][name="_.useSecurity"]');

    browser.setValue('#slaveAgentPortId', process.env.JENKINS_JNLP_PORT);
    yield browser.yieldable.save('jenkins-doing-enableSecurity-2');
    yield browser.yieldable.click('#radio-block-2');
    yield browser.yieldable.save('jenkins-doing-enableSecurity-3');
    yield browser.yieldable.click('#yui-gen1-button');

    var uid = process.env.LDAP_ATTR_LOGIN;
    browser
      .setValue('input[type="text"][name="_.server"]', process.env.LDAP_URL)
      .setValue('input[type="text"][name="_.rootDN"]', process.env.LDAP_BASE_DN)
      .setValue('input[type="text"][name="_.userSearch"]', uid + '={0}')
      .setValue('input[type="text"][name="_.managerDN"]', process.env.LDAP_BIND_DN)
      .setValue('input[type="password"][name="_.managerPasswordSecret"]', process.env.LDAP_BIND_PASSWORD)
      .setValue('input[type="text"][name="_.displayNameAttributeName"]', uid);

    yield browser.yieldable.save('jenkins-doing-enableSecurity-4');
    yield browser.yieldable.click('#yui-gen6-button');
    yield browser.yieldable.save('jenkins-after-enableSecurity');
  };

  browser.url(url + '/configureSecurity/');
  yield browser.yieldable.save('jenkins-before-enableSecurity');

  var useSecuritySelector = 'input[type="checkbox"][name="_.useSecurity"]';
  var isDisabledSecurity = (yield browser.yieldable.isExisting(useSecuritySelector))[0];
  if(isDisabledSecurity) {
    isDisabledSecurity = !((yield browser.yieldable.isSelected(useSecuritySelector))[0]);
  }

  if(isDisabledSecurity) {
    yield enableSecurity();
  }

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
    yield browser.yieldable.save('jenkins-doing-configureSecurity');
    yield browser.yieldable.click('#yui-gen6-button');
    yield browser.yieldable.save('jenkins-after-configureSecurity');
  }
  return isDisabledSecurity;
};

var enableMasterToSlaveAccessControl = function*(browser, url) {
  browser.url(url + '/configureSecurity/');
  yield browser.yieldable.save('jenkins-before-enableMasterToSlaveAccessControl');
  yield browser.yieldable.click('input[type="checkbox"][name="_.masterToSlaveAccessControl"]');
  yield browser.yieldable.save('jenkins-doing-enableMasterToSlaveAccessControl');
  yield browser.yieldable.click('#yui-gen6-button');
  yield browser.yieldable.save('jenkins-after-enableMasterToSlaveAccessControl');
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

var configureGitLab = function*(browser, url, gitlabUrl) {
  var apiToken = yield gitlab.getPrivateToken(browser, gitlabUrl);

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
  addDefaults: function(options) {
    options.jenkins       = options.jenkins             || {};
    options.jenkins.url   = options.jenkins.url         || 'http://jenkins.' + options.pocci.domain;
    options.jenkins.jnlpPort = options.jenkins.jnlpPort || '50000';
    // options.jenkins.nodes = options.jenkins.nodes;
    // options.jenkins.user = options.jenkins.user;
  },
  addEnvironment: function(options, environment) {
    var url = parse(options.jenkins.url);
    environment.JENKINS_URL       = util.getHref(url);        // jenkins.js, jenkins-slaves.yml, shell scripts
    environment.JENKINS_PROTOCOL  = url.protocol;
    environment.JENKINS_HOST      = url.hostname;
    environment.JENKINS_PORT      = util.getPort(url);
    environment.JENKINS_JNLP_PORT = options.jenkins.jnlpPort; // jenkins-slaves.yml, jenkins.js
  },
  setup: function*(browser, options) {
    yield this.handleSetup(browser, options, 'jenkins');
  },
  handleSetup: function*(browser, options, optionName) {
    var url = process.env.JENKINS_URL;
    var jenkinsOptions = options[optionName] || {};
    var userOptions = options.user || {};
    var jobs = jenkinsOptions.jobs || [];
    var loginUser = util.getUser(jenkinsOptions.user, userOptions.users);

    var isDisabledSecurity = yield enableLdap(browser, url, loginUser);

    var getJenkins = function() {
      return jenkinsLib(util.getURL(url, loginUser));
    };

    var jenkins = getJenkins();
    if(jenkinsOptions.nodes) {
      yield createNodes(jenkins, jenkinsOptions.nodes);
      yield saveSecrets(browser, url, jenkinsOptions.nodes);
      if(isDisabledSecurity) {
        yield enableMasterToSlaveAccessControl(browser, url);
      }
    }

    var gitlabUrl = process.env.GITLAB_URL;
    if(gitlabUrl) {
      yield gitlab.loginByAdmin(browser, gitlabUrl);
      yield configureGitLab(browser, url, gitlabUrl);
      yield createJobs(browser, jenkins, jobs, gitlabUrl);
      yield gitlab.logout(browser);
    }
  }
};
