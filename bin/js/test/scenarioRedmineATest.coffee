###global describe, it, before, after###
###jshint quotmark:true###
"use strict"

assert = require("chai").assert
webdriver = require("../lib/webdriver.js")
test = require("./resq.js")
scenarioTest = require("./scenarioTest.js")

describe "Scenario A (default)", ->
  @timeout(10 * 60 * 1000)
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

  it "user - login as boze", (done) ->
    scenarioTest.user.loginAsBoze(done, test, browser)

  it "user - change password", (done) ->
    scenarioTest.user.changePassword(done, test, browser)

