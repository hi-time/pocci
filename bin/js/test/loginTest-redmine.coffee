###global describe, it, before, after###
###jshint quotmark:true###
"use strict"

assert = require("chai").assert
webdriver = require("../lib/webdriver.js")
test = require("./resq.js")
loginGitLab = require("./loginTest.js").loginGitLab

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

  it "gitlab", (done) ->
    test done,
      expect: ->
        yield loginGitLab(browser)

  it "redmine", (done) ->
    test done,
      when: ->
        yield browser.url(process.env.REDMINE_URL + "/login")
          .call()
          .setValue("#username", "jenkinsci")
          .setValue("#password", "password")
          .submitForm("#login-form form")
          .call()

      then: ->
        text = yield browser.url(process.env.REDMINE_URL + "/")
          .call()
          .getText("#loggedas")

        assert.ok(text.indexOf("jenkinsci") > -1)

