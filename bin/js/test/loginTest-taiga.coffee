###global describe, it, before, after###
###jshint quotmark:true###
"use strict"

assert = require("chai").assert
webdriver = require("pocci/webdriver.js")
test = require("./resq.js")
loginGitLab = require("./loginTest.js").loginGitLab
loginUser = require("./loginTest.js").loginUser
loginSonar = require("./loginTest.js").loginSonar

describe "Login (taiga)", () ->
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

  it "taiga", (done) ->
    test done,
      when: ->
        yield browser
          .url(process.env.TAIGA_URL + "/login")
          .setValue("input[name='username']", "hamada")
          .setValue("input[name='password']", "password")
          .save("taiga-before-login")
          .click("button[title='Login']")
          .save("taiga-after-login")
          .pause(10000)

      then: ->
        text = yield browser
          .save("taiga-assert-login")
          .getText("a.user-avatar")

        assert.equal(text, "HAMADA, Kawao")

