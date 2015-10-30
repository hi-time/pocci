###global describe, it, before, after###
###jshint quotmark:true###
"use strict"

assert = require("chai").assert
webdriver = require("../lib/webdriver.js")
test = require("./resq.js")
loginGitLab = require("./loginTest.js").loginGitLab

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
        yield browser.yieldable.end()

  it "gitlab", (done) ->
    test done,
      expect: ->
        yield loginGitLab(browser)

  it "kanban", (done) ->
    test done,
      when: ->
        browser.url(process.env.KANBAN_URL + "/")
        yield browser.yieldable.save("kanban-before-Oauth")
        yield browser.click("[data-ng-click='oauth()']")
        yield browser.yieldable.save("kanban-after-Oauth")

        handles = yield browser.windowHandles()
        yield browser.switchTab(handles.value[1])

        yield browser.yieldable.save("kanban-before-autherize")
        yield browser.click("input[value='Authorize']")
        yield browser.switchTab(handles.value[0])
        yield browser.pause(10000)
        yield browser.yieldable.save("kanban-after-autherize")

      then: ->
        url = yield browser.url();
        assert.equal(url.value, process.env.KANBAN_URL + "/boards/")
