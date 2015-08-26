/*jshint camelcase: false */
'use strict';
var fs = require('fs');
var yaml = require('js-yaml');
var util = require('./util.js');
var parse = require('url').parse;
var gitlab = require('./gitlab.js');

var registerOauth = function*(browser, url, keys) {
  browser.url(url + '/oauth/applications/new');
  yield browser.yieldable.save('kanban-before-registerOauth');
  var redirectPath = '/assets/html/user/views/oauth.html';
  browser
    .setValue('#doorkeeper_application_name', 'Kanban')
    .setValue('#doorkeeper_application_redirect_uri',
        process.env.KANBAN_URL + redirectPath + '\n' +
        'http://kanban' + redirectPath);
  yield browser.yieldable.save('kanban-doing-registerOauth');

  browser.submitForm('#new_doorkeeper_application');
  yield browser.yieldable.save('kanban-after-registerOauth');

  keys.clientId = (yield browser.yieldable.getText('#application_id'))[0];
  keys.secret = (yield browser.yieldable.getText('#secret'))[0];
};

var updateComposeFile = function(keys) {
  var file = './config/services/kanban.yml.template';
  var text = fs.readFileSync(file, 'utf8')
              .replace(/GITLAB_API_TOKEN=.*/g, 'GITLAB_API_TOKEN=' + keys.apiToken)
              .replace(/GITLAB_OAUTH_CLIENT_ID=.*/g, 'GITLAB_OAUTH_CLIENT_ID=' + keys.clientId)
              .replace(/GITLAB_OAUTH_CLIENT_SECRET=.*/g, 'GITLAB_OAUTH_CLIENT_SECRET=' + keys.secret);
  fs.writeFileSync(file, text);
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
                  .replace('proxy:', 'kanban:')
                  .replace(/\.\/build/g,'./volumes/kanban/build')
                  .replace(/^client:/m, 'kanbanclient:')
                  .replace(/^backend:/m, 'kanbanbackend:')
                  .replace(/^wsserver:/m, 'kanbanwsserver:')
                  .replace(/^redis:/m, 'kanbanredis:')
                  .replace(/^rabbitmq:/m, 'kanbanrabbitmq:')
                  .replace(/client:client/g, 'kanbanclient:client')
                  .replace(/backend:backend/g, 'kanbanbackend:backend')
                  .replace(/wsserver:wsserver/g, 'kanbanwsserver:wsserver')
                  .replace(/redis:redis/g, 'kanbanredis:redis')
                  .replace(/rabbitmq:rabbitmq/g, 'kanbanrabbitmq:rabbitmq')
                  .replace(/https:\/\/gitlab.com/g, 'http://gitlab.${POCCI_DOMAIN_NAME}');
    var containers = yaml.safeLoad(yamlText);
    var names = Object.keys(containers);
    for(var i = 0; i < names.length; i++) {
      var name = names[i];
      var container = containers[name];
      container.dns = '172.17.42.1';
      container.env_file = ['./.env'];
      if(name === 'kanban') {
        delete container.ports;
      }
      if(name === 'kanbanredis') {
        delete container.volumes;
      }
    }
    console.log(yaml.dump(containers));
  },
  setup: function*(browser) {
    var url = process.env.GITLAB_URL;
    yield gitlab.loginByAdmin(browser, url);

    var token = yield gitlab.getPrivateToken(browser, url);
    var keys = {};
    keys.apiToken = token;
    yield registerOauth(browser, url, keys);
    updateComposeFile(keys);
    yield gitlab.logout(browser);
  }
};
