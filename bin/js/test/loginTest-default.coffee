###global describe, it, before, after###
###jshint quotmark:true###
"use strict"

assert = require("chai").assert
webdriver = require("pocci/webdriver.js")
test = require("./resq.js")
loginGitLab = require("./loginTest.js").loginGitLab
loginUser = require("./loginTest.js").loginUser
loginSonar = require("./loginTest.js").loginSonar

describe "Login (default)", () ->
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

  it "gitlab", (done) ->
    test done,
      expect: ->
        yield loginGitLab(browser)

  it "kanban", (done) ->
    test done,
      when: ->
        yield browser
          .url(process.env.KANBAN_URL + "/")
          .save("kanban-before-Oauth")
          .click("[data-ng-click='oauth()']")
          .save("kanban-after-Oauth")

        handles = yield browser.windowHandles()
        console.log(handles)

        yield browser.switchTab(handles.value[1])
          .save("kanban-before-autherize")
          .click("input[value='Authorize']")
          .switchTab(handles.value[0])
          .pause(10000)
          .save("kanban-after-autherize")

      then: ->
        url = yield browser.url();
        assert.equal(url.value, process.env.KANBAN_URL + "/boards/")
