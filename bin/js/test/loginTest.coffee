###jshint quotmark:true###
"use strict"

assert = require("chai").assert
webdriver = require("pocci/webdriver.js")
test = require("./resq.js")

module.exports.loginGitLab = (browser) ->
  yield browser
    .url(process.env.GITLAB_URL + "/users/sign_in")
    .setValue("#username", "boze")
    .setValue("#password", "password")
    .submitForm("#new_ldap_user")
    .url(process.env.GITLAB_URL + "/profile/")
  text = yield browser.getValue("#user_name")
  assert.equal(text, "BOZE, Taro")

module.exports.loginJenkins = (browser) ->
  yield browser
    .url(process.env.JENKINS_URL + "/login")
    .setValue("#j_username", "boze")
    .setValue("input[type='password'][name='j_password']", "password")
    .save("jenkins-before-login")
    .click("button")
    .pause(1000)
    .save("jenkins-after-login")

  text = yield browser
    .url(process.env.JENKINS_URL + "/")
    .save("jenkins-assert-login")
    .getText("#header div.login a[href='/user/boze'] > b")
  assert.equal(text, "boze")

module.exports.loginUser = (browser) ->
  yield browser
    .url(process.env.USER_URL)
    .pause(1000)
    .setValue("#login-cn", "admin")
    .pause(1000)
    .setValue("#login-userPassword", "admin")
    .save("user-admin-berore-autherize")
    .click("#login button")
    .save("user-admin-after-autherize")
  assert.isOk(yield browser.isExisting("#search-form"))

module.exports.loginSonar = (browser) ->
  yield browser
    .url(process.env.SONAR_URL + "/sessions/new")
    .setValue("#login", "boze")
    .setValue("#password", "password")
    .save("sonar-before-login")
    .submitForm("form")
    .pause(2000)
    .save("sonar-after-login")
  text = yield browser.getText("nav")
  assert.isOk(text.indexOf("boze") > -1)

module.exports.loginNexus = (browser) ->
  yield browser.url(process.env.NEXUS_URL)
    .pause(12000)
    .click("a[data-qtip='Sign in']")
    .save("nexus-before-login")
    .pause(2000)
    .setValue("input[name='username']", "admin")
    .setValue("input[name='password']", "admin123")
    .click("a.x-btn-nx-primary-small")

  text = yield browser
    .save("nexus-after-login")
    .pause(2000)
    .getText("[data-name='user']")
  assert.isOk(text.indexOf("admin") > -1)
