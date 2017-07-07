/*jshint camelcase: false */
/*global document*/
'use strict';
var fs = require('fs');
var thunkify = require('thunkify');
var jenkinsLib = require('jenkins');
var path = require('path');
var gitlab = require('pocci/gitlab.js');
var util = require('pocci/util.js');
var workspace = require('pocci/workspace.js');
var parse = require('url').parse;
var smtp = require('pocci/smtp.js');

var registerGitLab = function*(browser, url, job) {
  var jenkinsJobUrl = process.env.JENKINS_URL + '/project/' + job.jobName;

  yield browser.url(url + '/settings/integrations')
    .save('jenkins-after-registerGitLab')
    .setValue('#hook_url', jenkinsJobUrl);

  var isSelected = yield browser.isSelected('#hook_push_events');
  if (!isSelected) {
    yield browser.click('#hook_push_events');
  }

  isSelected = yield browser.isSelected('#hook_merge_requests_events');
  if (!isSelected) {
    yield browser.click('#hook_merge_requests_events');
  }

  yield browser.save('jenkins-doing-registerGitLab')
    .submitForm('#new_hook')
    .save('jenkins-after-registerGitLab');
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
    remoteFS: '/var/workspace',
    numExecutors: 1,
    exclusive: false
  };

  yield create(options);
};

var createNodes = function*(jenkins, nodes) {
  for(var i = 0; i < nodes.length; i++) {
    yield createNode(jenkins, nodes[i].name);
  }
};

var enableLdap = function*(browser, url, loginUser) {
  var enableSecurity = function*() {
    var uid = process.env.LDAP_ATTR_LOGIN;
    yield browser.save('jenkins-doing-enableSecurity-a');

    var useSecurity = 'input[type="checkbox"][name="_.useSecurity"]'; 
    for(var i = 0; i < 10; i++) {
        if(!(yield browser.isSelected(useSecurity))) {
            yield browser.pause(1000).click(useSecurity)
                .save('jenkins-doing-enableSecurity-b-' + i);
        }
    }
    var slaveAgentPortType = '[name="slaveAgentPort.type"][value="fixed"]';
    if(!(yield browser.isVisible(slaveAgentPortType))) {
        var refid = yield browser.getAttribute(useSecurity, 'id');
        yield browser.execute(function(selector) {
            document.querySelectorAll(selector).forEach(function(e){e.style = '';});
        }, '[nameref="' + refid + '"]').save('jenkins-doing-enableSecurity-c');
    }

    yield browser
      .click(slaveAgentPortType)
      .save('jenkins-doing-enableSecurity-d')
      .setValue('#slaveAgentPortId', process.env.JENKINS_JNLP_PORT)
      .save('jenkins-doing-enableSecurity-2')
      .click('#radio-block-2')
      .save('jenkins-doing-enableSecurity-3')
      .click('#yui-gen4-button')
      .setValue('input[type="text"][name="_.server"]', process.env.LDAP_URL)
      .setValue('input[type="text"][name="_.rootDN"]', process.env.LDAP_BASE_DN)
      .setValue('input[type="text"][name="_.userSearch"]', uid + '={0}')
      .setValue('input[type="text"][name="_.managerDN"]', process.env.LDAP_BIND_DN)
      .setValue('input[type="password"][name="_.managerPasswordSecret"]', process.env.LDAP_BIND_PASSWORD)
      .setValue('input[type="text"][name="_.displayNameAttributeName"]', uid)
      .click('input[name="_.enabled"]')
      .scroll('input[name="authorization"][type="radio"][value="0"]')
      .save('jenkins-doing-enableSecurity-4')
      .click('[name="Submit"] button')
      .save('jenkins-after-enableSecurity');
  };

  yield browser.url(url + '/configureSecurity/')
    .save('jenkins-before-enableSecurity');

  var useSecuritySelector = 'input[type="checkbox"][name="_.useSecurity"]';
  var isDisabledSecurity = yield browser.isExisting(useSecuritySelector);
  if(isDisabledSecurity) {
    isDisabledSecurity = !(yield browser.isSelected(useSecuritySelector));
  }

  if(isDisabledSecurity) {
    yield enableSecurity();
  }

  var login = function*() {
    yield browser.url(url + '/login')
      .save('jenkins-before-login-by-' + loginUser.uid)
      .setValue('#j_username', loginUser.uid)
      .setValue('input[type="password"][name="j_password"]', loginUser.userPassword)
      .save('jenkins-doing-login-by-' + loginUser.uid)
      .click('[name="Submit"] button')
      .save('jenkins-after-login-by-' + loginUser.uid);
  };

  if(isDisabledSecurity) {
    yield login();
    yield browser.url(url + '/configureSecurity/')
      .save('jenkins-before-configureSecurity')
      .click('#radio-block-8')
      .click('input[name="authorization"][type="radio"][value="2"]')
      .waitForSelected('input[name="authorization"][type="radio"]', '2')
      .scroll('input[name="authorization"][type="radio"][value="0"]')
      .save('jenkins-doing-configureSecurity')
      .click('[name="Submit"] button')
      .save('jenkins-after-configureSecurity');
  }
  yield login();
  return isDisabledSecurity;
};

var enableMasterToSlaveAccessControl = function*(browser, url) {
  yield browser.url(url + '/configureSecurity/')
    .save('jenkins-before-enableMasterToSlaveAccessControl')
    .click('input[type="checkbox"][name="_.masterToSlaveAccessControl"]')
    .save('jenkins-doing-enableMasterToSlaveAccessControl')
    .click('[name="Submit"] button')
    .save('jenkins-after-enableMasterToSlaveAccessControl');
};

var saveSecret = function*(browser, url, node, isEnabledAuth) {
  yield browser.url(url + '/computer/' + node.name)
    .save('jenkins-saveSecret');

  var secret = '';
  if(isEnabledAuth) {
    var text = yield browser.getText('pre');
    secret = text.replace(/.*-secret/,'-secret');
  }
  workspace.writeConfiguration('./config/services/core/jenkins/slave', node, secret);
};

var saveSecrets = function*(browser, url, nodes, isEnabledAuth) {
  for(var i = 0; i < nodes.length; i++) {
    yield saveSecret(browser, url, nodes[i], isEnabledAuth);
  }
};

var configureGitLab = function*(browser, url, gitlabUrl) {
  var apiToken = yield gitlab.getPrivateToken(browser, gitlabUrl);

  yield browser.url(url + '/configure')
    .save('jenkins-before-configureGitLab')
    .setValue('input[type="text"][checkurl="/descriptorByName/com.dabsquared.gitlabjenkins.connection.GitLabConnectionConfig/checkName"]', 'default')
    .setValue('input[type="text"][checkurl="/descriptorByName/com.dabsquared.gitlabjenkins.connection.GitLabConnectionConfig/checkUrl"]', gitlabUrl)
    .click('button.credentials-add-menu')
    .pause(1000)
    .click('li[data-url="/descriptor/com.cloudbees.plugins.credentials.CredentialsSelectHelper/resolver/com.cloudbees.plugins.credentials.CredentialsSelectHelper$SystemContextResolver/provider/com.cloudbees.plugins.credentials.SystemCredentialsProvider$ProviderImpl/context/jenkins/dialog"]')
    .pause(5000)
    .save('jenkins-doing-configureGitLab')
    .selectByValue('#credentials-dialog-form select.setting-input.dropdownList', '2')
    .pause(1000)
    .setValue('#credentials-dialog-form input[name="_.apiToken"]', apiToken)
    .setValue('#credentials-dialog-form tr:not([field-disabled]) > td > input[name="_.id"]', 'default')
    .click('#credentials-add-submit-button')
    .pause(2000)
    .selectByIndex('select[checkurl="/descriptorByName/com.dabsquared.gitlabjenkins.connection.GitLabConnectionConfig/checkApiTokenId"]', 1)
    .save('jenkins-doing-configureGitLab')
    .click('.submit-button.primary button')
    .save('jenkins-after-configureGitLab');
};

var configureMail = function*(browser, url) {
  yield browser.url(url + '/configure')
    .save('jenkins-before-configureMail')
    .setValue('input[type="text"][name="_.smtpServer"]', process.env.JENKINS_SMTP_HOST)
    .setValue('input[type="text"][name="_.adminAddress"]', process.env.JENKINS_MAIL_ADDRESS)
    .save('jenkins-doing-configureMail')
    .click('.submit-button.primary button')
    .save('jenkins-after-configureMail');
};

module.exports = {
  addDefaults: function(options) {
    options.jenkins             = options.jenkins             || {};
    options.jenkins.url         = options.jenkins.url         || 'http://jenkins.' + options.pocci.domain;
    options.jenkins.jnlpPort    = options.jenkins.jnlpPort    || '50000';
    options.jenkins.smtpHost    = options.jenkins.smtpHost    || smtp.getHost(options);
    options.jenkins.mailAddress = options.jenkins.mailAddress || options.pocci.adminMailAddress;
    // options.jenkins.nodes = options.jenkins.nodes;
    // options.jenkins.user = options.jenkins.user;
  },
  addEnvironment: function(options, environment) {
    var url = parse(options.jenkins.url);
    environment.JENKINS_URL           = util.getHref(url);            // jenkins.js, workspaces.yml, shell scripts
    environment.JENKINS_PROTOCOL      = url.protocol;
    environment.JENKINS_HOST          = url.hostname;
    environment.JENKINS_PORT          = util.getPort(url);
    environment.JENKINS_JNLP_PORT     = options.jenkins.jnlpPort;     // workspaces.yml, jenkins.js
    environment.JENKINS_SMTP_HOST     = options.jenkins.smtpHost;     // jenkins.js
    environment.JENKINS_MAIL_ADDRESS  = options.jenkins.mailAddress;  // jenkins.js
  },
  setup: function*(browser, options) {
    yield this.handleSetup(browser, options, 'jenkins');
  },
  handleSetup: function*(browser, options, optionName) {
    var url = process.env.JENKINS_URL;
    var jenkinsOptions = options[optionName] || {};
    var userOptions = options.user || {};
    var jobs = jenkinsOptions.jobs || [];
    var isEnabledAuth = process.env.ALL_SERVICES.indexOf('user') > -1;
    var isEnabledGitLab = process.env.ALL_SERVICES.indexOf('gitlab') > -1;
    var users = util.toArray(jenkinsOptions.users || userOptions.users);
    var loginUser = util.getUser(jenkinsOptions.user, users);

    var isDisabledSecurity = false;
    if(isEnabledAuth) {
      isDisabledSecurity = yield enableLdap(browser, url, loginUser);
    }
    yield configureMail(browser, url);

    var getJenkins = function() {
      return jenkinsLib((isEnabledAuth)? util.getURL(url, loginUser) : url);
    };

    var jenkins = getJenkins();
    if(jenkinsOptions.nodes) {
      var nodes = workspace.normalize(jenkinsOptions.nodes);
      yield createNodes(jenkins, nodes);
      yield saveSecrets(browser, url, nodes, isEnabledAuth);
      if(isDisabledSecurity) {
        yield enableMasterToSlaveAccessControl(browser, url);
      }
    }

    if(isEnabledGitLab) {
      var gitlabUrl = process.env.GITLAB_URL;
      yield gitlab.loginAs(browser, gitlabUrl, loginUser);
      yield configureGitLab(browser, url, gitlabUrl);
      yield createJobs(browser, jenkins, jobs, gitlabUrl);
      yield gitlab.logout(browser);
    }
  }
};
