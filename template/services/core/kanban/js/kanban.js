/*jshint camelcase: false */
'use strict';
var fs = require('fs');
var yaml = require('js-yaml');
var util = require('pocci/util.js');
var parse = require('url').parse;
var gitlab = require('pocci/gitlab.js');
var server = require('co-request');

var registerOauth = function*(browser, url, keys) {
  browser.url(url + '/oauth/applications/new');
  yield browser.save('kanban-before-registerOauth');
  var redirectPath = '/assets/html/user/views/oauth.html';
  browser
    .setValue('#doorkeeper_application_name', 'Kanban')
    .setValue('#doorkeeper_application_redirect_uri',
        process.env.KANBAN_URL + redirectPath + '\n' +
        'http://kanban' + redirectPath);
  yield browser.save('kanban-doing-registerOauth');

  browser.submitForm('#new_doorkeeper_application');
  yield browser.save('kanban-after-registerOauth');

  keys.clientId = yield browser.getText('#application_id');
  keys.secret = yield browser.getText('#secret');
};

var updateComposeFile = function(keys) {
  var file = './config/services/core/kanban/docker-compose.yml.template';
  var text = fs.readFileSync(file, 'utf8')
              .replace(/KANBAN_GITLAB_CLIENT=.*/g, 'KANBAN_GITLAB_CLIENT=' + keys.clientId)
              .replace(/KANBAN_GITLAB_SECRET=.*/g, 'KANBAN_GITLAB_SECRET=' + keys.secret);
  fs.writeFileSync(file, text);
};


var deleteLabels = function*(request, path) {
  var response = yield server.get(request(path));
  util.assertStatus(response, 'response.statusCode < 300');
  for(var i = 0; i < response.body.length; i++) {
    yield server.del(request(path), {
      name: response.body[i].name
    });
  }
};

var createLabels = function*(request, path, labels) {
  for(var i = 0; i < labels.length; i++) {
    var response = yield server.post(request(path, {
      name: 'KB[stage][' + i + '][' + labels[i] + ']',
      color: '#F5F5F5'
    }));
    util.assertStatus(response, 'response.statusCode === 201');
  }
};

var addStage = function*(request, option) {
  var projectId = yield gitlab.getProjectId(request, option.board);
  var path = '/projects/' + projectId + '/labels';
  yield deleteLabels(request, path);
  yield createLabels(request, path, option.stages);
};

var addStages = function*(request, options) {
  options = util.toArray(options);
  for(var i = 0; i < options.length; i++) {
    yield addStage(request, options[i]);
  }
};

module.exports = {
  addDefaults: function(options) {
    options.kanban      = options.kanban       || {};
    options.kanban.url  = options.kanban.url   || 'http://kanban.' + options.pocci.domain;
  },
  addEnvironment: function(options, environment) {
    var url = parse(options.kanban.url);
    environment.KANBAN_URL        = util.getHref(url);  // kanban.js
    environment.KANBAN_PROTOCOL   = url.protocol;
    environment.KANBAN_HOST       = url.hostname;
    environment.KANBAN_PORT       = util.getPort(url);
  },
  edit: function(yamlFile) {
    var yamlText = fs.readFileSync(yamlFile, 'utf8')
                  .replace('proxy:', 'kanbanproxy:')
                  .replace(/\.\/build/g,'./volumes/kanban/build')
                  .replace(/http:\/\/kanban.gitlab.com/g, 'http://kanban.${POCCI_DOMAIN_NAME}')
                  .replace(/KANBAN_SECURITY_SECRET=qwerty/g, 'KANBAN_SECURITY_SECRET=' + Math.random().toString(36).slice(-15))
                  .replace(/^redis:/m, 'kanbanredis:')
                  .replace(/redis:redis/g, 'kanbanredis:redis')
                  .replace(/https:\/\/gitlab.com/g, 'http://gitlab.${POCCI_DOMAIN_NAME}');
    var containers = yaml.safeLoad(yamlText);
    var names = Object.keys(containers);
    for(var i = 0; i < names.length; i++) {
      var name = names[i];
      var container = containers[name];
      container.dns = '${DNS_ADDRESS}';
      container.env_file = ['./.env'];
      if(name === 'kanbanproxy') {
        delete container.ports;
        container.volumes.push('/var/log/nginx');
      }
      if(name === 'kanbanredis') {
        container.volumes = ['/data'];
      }
    }
    console.log(yaml.dump(containers));
  },
  setup: function*(browser, options) {
    var url = process.env.GITLAB_URL;
    yield gitlab.loginByAdmin(browser, url);

    var keys = {};
    yield registerOauth(browser, url, keys);
    updateComposeFile(keys);
    if(options.kanban) {
      var request = yield gitlab.createRequest(browser, url);
      yield addStages(request, options.kanban);
    }
    yield gitlab.logout(browser);
  }
};
