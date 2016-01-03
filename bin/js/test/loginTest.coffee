###global describe, it, before, after###
###jshint quotmark:true###
"use strict"

assert = require("chai").assert
webdriver = require("pocci/webdriver.js")
test = require("./resq.js")

module.exports.loginGitLab = (browser) ->
  browser
    .url(process.env.GITLAB_URL + "/users/sign_in")
    .setValue("#username", "boze")
    .setValue("#password", "password")
    .submitForm("#new_ldap_user")

  yield browser.call()

  browser.url(process.env.GITLAB_URL + "/profile/")
  text = yield browser.getValue("#user_name")
  assert.equal(text, "BOZE, Taro")

module.exports.loginJenkins = (browser) ->
  yield browser
    .url(process.env.JENKINS_URL + "/login")
    .call()
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


describe "Login", () ->
  @timeout(120000)
  browser = null

  before (done) ->
    test done,
      setup: ->
        yield webdriver.init()
        browser = webdriver.browser
        return

  after (done) ->
    test done,
      setup: ->
        yield browser.end()

  it "user", (done) ->
    test done,
      when: ->
        yield browser
          .url(process.env.USER_URL)
          .call()
          .setValue("#login-cn", "admin")
          .setValue("#login-userPassword", "admin")
          .save("user-admin-berore-autherize")
          .click("#login button")
          .save("user-admin-after-autherize")

      then: ->
        assert.ok(yield browser.isExisting("#search-form"))

  it "sonar", (done) ->
    test done,
      when: ->
        yield browser
          .url(process.env.SONAR_URL + "/sessions/new")
          .call()
          .setValue("#login", "boze")
          .setValue("#password", "password")
          .save("sonar-before-login")
          .submitForm("form")
          .pause(2000)
          .save("sonar-after-login")

      then: ->
        text = yield browser.getText("nav")
        assert.ok(text.indexOf("boze") > -1)
