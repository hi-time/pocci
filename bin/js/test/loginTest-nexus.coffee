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
loginNexus = require("./loginTest.js").loginNexus

describe "Login (nexus)", () ->
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

  it "nexus", (done) ->
    test done,
      expect: ->
        yield loginNexus(browser)
