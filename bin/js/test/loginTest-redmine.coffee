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
        yield browser.yieldable.end()

  it "gitlab", (done) ->
    test done,
      expect: ->
        yield loginGitLab(browser)

  it "redmine", (done) ->
    test done,
      when: ->
        browser.url(process.env.REDMINE_URL + "/login")
        yield browser.yieldable.call()
        browser.setValue("#username", "jenkinsci").setValue("#password", "password")
        yield browser.yieldable.call()
        browser.submitForm("#login-form form");

      then: ->
        browser.url(process.env.REDMINE_URL + "/")
        yield browser.yieldable.call()
        text = (yield browser.yieldable.getText("#loggedas"))[0]
        assert.ok(text.indexOf("jenkinsci") > -1)

