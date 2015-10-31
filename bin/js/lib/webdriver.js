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
    .addCommand('save', function(){
      var name = arguments[0];
      var callback = arguments[arguments.length - 1];
      var fileName = ('00' + (++num)).slice(-3) + '-' + name + '.png';
      console.log('-   Take screenshot : ' + fileName);
      this.call();
      //this.saveScreenshot(ssdir + '/' + fileName).call(callback);
      function retry(maxRetries, browser) {
        browser.saveScreenshot(ssdir + '/' + fileName).catch(function(err){
          if (maxRetries <= 0) {
            throw err;
          }
          console.log('-   Retry:' + maxRetries);
          retry(maxRetries - 1, browser); 
        });
      }
      retry(10, this);
      this.call(callback);
    }.bind(browser))
    .addCommand('click', function(){
      var selector = arguments[0];
      var callback = arguments[arguments.length - 1];
      browser.originalClick(selector).catch(function() {
        this.execute(
          function(selector) {
            document.querySelector(selector).click();
          }, selector);
      });
      this.call(callback);
    }.bind(browser));

  yield browser.timeouts('script', 60 * 1000)
    .timeouts('implicit', 10 * 1000)
    .timeouts('page load', 120 * 1000)
    .windowHandleMaximize()
    .call();

  module.exports.browser = browser;
};
