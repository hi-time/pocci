/*global document*/
'use strict';
var webdriver = require('webdriverio');
var selenium = require('selenium-standalone');
var thunkify = require('thunkify');
var fs = require('fs');

module.exports.init = function*() {
  var ssdir = './config/screen';
  if(!fs.existsSync(ssdir)) {
    fs.mkdirSync(ssdir);
  }
  var num = 0;

  yield thunkify(selenium.start.bind(selenium))({spawnOptions: {stdio: 'inherit'}});
  var browser = webdriver.remote({desiredCapabilities:{browserName:'chrome'}}).init();
  browser.originalClick = browser.click;
  browser
    .addCommand('save', function async (name){
      var fileName = ('00' + (++num)).slice(-3) + '-' + name + '.png';
      console.log('-   Take screenshot : ' + fileName);
      return browser.saveScreenshot(ssdir + '/' + fileName).catch(function(){
        console.log('-   Retry : ' + fileName);
        return browser.saveScreenshot(ssdir + '/' + fileName);
      });
    });

  browser
    .addCommand('click', function async (selector){
      return browser.originalClick(selector).catch(function() {
        return browser.execute(
          function(selector) {
            document.querySelector(selector).click();
          }, selector);
      });
    }, true);

  yield browser.timeouts('script', 60 * 1000)
    .timeouts('implicit', 10 * 1000)
    .timeouts('page load', 120 * 1000)
    .windowHandleMaximize();

  module.exports.browser = browser;
};
