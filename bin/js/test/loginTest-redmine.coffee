###global describe, it, before, after###
###jshint quotmark:true###
"use strict"

assert = require("chai").assert
webdriver = require("pocci/webdriver.js")
test = require("./resq.js")
loginGitLab = require("./loginTest.js").loginGitLab
loginJenkins = require("./loginTest.js").loginJenkins
loginUser = require("./loginTest.js").loginUser
loginSonar = require("./loginTest.js").loginSonar

describe "Login (redmine)", () ->
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
      expect: ->
        yield loginUser(browser)

  it "sonar", (done) ->
    test done,
      expect: ->
        yield loginSonar(browser)

  it "jenkins", (done) ->
    test done,
      expect: ->
        yield loginJenkins(browser)

  it "gitlab", (done) ->
    test done,
      expect: ->
        yield loginGitLab(browser)

  it "redmine", (done) ->
    test done,
      when: ->
        yield browser.url(process.env.REDMINE_URL + "/login")
          .setValue("#username", "jenkinsci")
          .setValue("#password", "password")
          .submitForm("#login-form form")

      then: ->
        text = yield browser.url(process.env.REDMINE_URL + "/")
          .getText("#loggedas")

        assert.isOk(text.indexOf("jenkinsci") > -1)

