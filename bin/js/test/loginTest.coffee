###global describe, it, before, after###
###jshint quotmark:true###
"use strict"

assert = require("chai").assert
webdriver = require("../lib/webdriver.js")
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
          .url(process.env.USER_URL + "/cmd.php?cmd=login_form")
          .call()
          .setValue("#login", "cn=admin,dc=example,dc=com")
          .setValue("#password", "admin")
          .submitForm("form")
          .call()

      then: ->
        text = yield browser
          .url(process.env.USER_URL + "/")
          .call()
          .getText("td.logged_in")
        assert.equal(text, "Logged in as: cn=admin")


  it "jenkins", (done) ->
    test done,
      when: ->
        yield browser
          .url(process.env.JENKINS_URL + "/login")
          .call()
          .setValue("#j_username", "boze")
          .setValue("input[type='password'][name='j_password']", "password")
          .save("jenkins-before-login")
          .click("button")
          .pause(1000)
          .save("jenkins-after-login")

      then: ->
        text = yield browser
          .url(process.env.JENKINS_URL + "/")
          .save("jenkins-assert-login")
          .getText("#header div.login a[href='/user/boze'] > b")
        assert.equal(text, "boze")


  it "sonar", (done) ->
    test done,
      when: ->
        yield browser
          .url(process.env.SONAR_URL + "/sessions/new")
          .call()
          .setValue("#login", "jenkinsci")
          .setValue("#password", "password")
          .submitForm("form")
          .call()

      then: ->
        text = yield browser
          .url(process.env.SONAR_URL + "/")
          .pause(1000)
          .call()
          .getText("nav")
        assert.ok(text.indexOf("jenkinsci") > -1)
