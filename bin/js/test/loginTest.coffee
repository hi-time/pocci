###global describe, it, before, after###
###jshint quotmark:true###
"use strict"

assert = require("chai").assert
webdriver = require("../lib/webdriver.js")
test = require("./resq.js")

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
        yield browser.yieldable.end()


  it "ldap", (done) ->
    test done,
      when: ->
        browser
          .url(process.env.USER_URL + "/cmd.php?cmd=login_form")
          .setValue("#login", "cn=admin,dc=example,dc=com")
          .setValue("#password", "admin")
          .submitForm("form")

        yield browser.yieldable.call()

      then: ->
        browser.url(process.env.USER_URL + "/")
        text = (yield browser.yieldable.getText("td.logged_in"))[0]
        assert.equal(text, "Logged in as: cn=admin")


  it "jenkins", (done) ->
    test done,
      when: ->
        browser
          .url(process.env.JENKINS_URL + "/login")
          .setValue("#j_username", "bouze")
          .setValue("input[type='password'][name='j_password']", "password")

        yield browser.yieldable.call()
        yield browser.yieldable.click("button")

      then: ->
        browser.url(process.env.JENKINS_URL + "/")
        text = (yield browser.yieldable.getText("#header div.login a[href='/user/bouze'] > b"))[0]
        assert.equal(text, "bouze")


  it "sonar", (done) ->
    test done,
      when: ->
        browser
          .url(process.env.SONAR_URL + "/sessions/new")
          .setValue("#login", "jenkinsci")
          .setValue("#password", "password")
          .submitForm("form")

        yield browser.yieldable.call()
      then: ->
        browser.url(process.env.SONAR_URL + "/")
        browser.pause(1000)
        text = (yield browser.yieldable.getText("nav"))[0]
        assert.ok(text.indexOf("jenkinsci") > -1)


  it "gitlab", (done) ->
    loginGitHub = ->
      browser
        .url(process.env.GITLAB_URL + "/users/sign_in")
        .setValue("#username", "bouze")
        .setValue("#password", "password")
        .submitForm("#new_ldap_user")

      yield browser.yieldable.call()

      browser.url(process.env.GITLAB_URL + "/profile/")
      text = (yield browser.yieldable.getValue("#user_name"))[0]
      assert.equal(text, "bouze")

    test done,
      expect: ->
        yield loginGitHub()
