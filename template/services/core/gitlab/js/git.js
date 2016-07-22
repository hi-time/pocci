'use strict';
var fs = require('fs');
var spawn = require('co-child-process');
var path = require('path');
var util = require('pocci/util.js');

var deleteFile = function(file) {
    try {
      fs.unlinkSync(file);
    } catch(e) {
      // ignore
    }
};

var selectCIConfigFile = function(localPath, options) {
  if(options.pocci.services.indexOf('jenkins') === -1) {
    deleteFile(path.join(localPath, 'jenkins-config.xml'));
  } else {
    deleteFile(path.join(localPath, '.gitlab-ci.yml'));
  }
};

var importCode = function*(url, options, ldapUsers) {
  var user = util.getUser(options.user, ldapUsers);
  var remoteUrl = util.getURL(url, user, options.remotePath);
  var shellScript = path.resolve(__dirname, 'git-import.sh');
  var args = [
    shellScript,
    remoteUrl,
    options.localPath,
    user.uid,
    user.mail,
    options.commitMessage
  ];

  yield spawn('/bin/bash', args, {stdio: 'inherit'});
};

module.exports = {
  handleSetup: function*(browser, options) {
    var repos = options.repositories || [];
    var userOptions = options.user || {};
    var url = process.env.GITLAB_URL;
    for(var i = 0; i < repos.length; i++) {
      selectCIConfigFile(repos[i].localPath, options);
      yield importCode(url, repos[i], userOptions.users);
    }
  }
};
