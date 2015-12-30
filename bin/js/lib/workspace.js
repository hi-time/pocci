/*jshint camelcase: false */
'use strict';
var fs = require('fs');
var mkdirp = require('mkdirp');
var util = require('pocci/util.js');

var copyConfigFile = function(templateConfigDirectory, configDirectory, fileName) {
  fs.createReadStream(templateConfigDirectory + '/' + fileName)
    .pipe(fs.createWriteStream(configDirectory + '/' + fileName));
};

var writeProxyEnv = function(workspaceName) {
  var proxy = '';
  if(process.env.http_proxy) {
    proxy = 'export http_proxy=' + process.env.http_proxy + '\n' +
                'export https_proxy=' + process.env.https_proxy + '\n' +
                'export ftp_proxy=' + process.env.ftp_proxy + '\n' +
                'export no_proxy=' + process.env.no_proxy + '\n';
  }
  fs.writeFileSync('./config/image/' + workspaceName + '/config/proxy.env', proxy);
};

var writeDockerFile = function(templateDirectory, workspace) {
  var templateConfigDirectory = templateDirectory + '/image/config';
  var configDirectory = './config/image/' + workspace.name + '/config';
  mkdirp.sync(configDirectory);

  var dockerfileTemplate = templateDirectory + '/image/Dockerfile.template';
  var text = fs.readFileSync(dockerfileTemplate, 'utf8').replace(/__FROM/g, workspace.from);
  fs.writeFileSync('./config/image/' + workspace.name + '/Dockerfile', text);

  var files = fs.readdirSync(templateConfigDirectory);
  for(var i = 0; i < files.length; i++) {
    copyConfigFile(templateConfigDirectory, configDirectory, files[i]);
  }
  writeProxyEnv(workspace.name);
};

var normalizeWorkspace = function(workspace, workspaces, version) {
  if(typeof workspace === 'string') {
    workspaces.push({
      name: workspace, 
      image: 'image: xpfriend/workspace-' + workspace + ':' + version[workspace]
    });
    return;
  }

  if(typeof workspace === 'object') {
    var keys = Object.keys(workspace);
    for(var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var value = workspace[key];
      if(typeof value === 'string') {
        workspaces.push({name: key, image: 'image: ' + value});
      } else if(typeof value === 'object' && value.from) {
        workspaces.push({name: key, image: 'build: ${CONFIG_DIR}/image/' + key, from: value.from});
      }
    }
  }
};

module.exports = {
  normalize: function(workspaces) {
    workspaces = util.toArray(workspaces);
    var normalized = [];
    var version = require('pocci/workspaces-version.json');
    for(var i = 0; i < workspaces.length; i++) {
      normalizeWorkspace(workspaces[i], normalized, version);
    }
    return normalized;
  },
  writeConfiguration: function(templateDirectory, workspace, secret) {
    var templateFilePath = templateDirectory + '/workspaces.yml.template';
    var text = fs.readFileSync(templateFilePath, 'utf8')
                .replace(/__NAME/g, workspace.name)
                .replace(/__IMAGE/g, workspace.image)
                .replace(/__SECRET/g, secret);
    fs.appendFileSync('./config/workspaces.yml.template', text);

    if(workspace.from) {
      writeDockerFile(templateDirectory, workspace);
    }
  }
};
