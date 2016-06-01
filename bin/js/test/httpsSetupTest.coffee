###global describe, it, before, after###
###jshint quotmark:true###
"use strict"

path = require("path")
setup = require("pocci/setup.js")
test = require("./resq.js")
scenarioTest = require("./scenarioTest.js")

describe "setup.https.yml", ->
  @timeout(10 * 60 * 1000)
  
  before (done) ->
    test done,
      setup: ->
        yield setup.initBrowser()
  
  after (done) ->
    test done,
      cleanup: ->
        yield setup.browser.end()
  
  it "user", (done) ->
    scenarioTest.user.loginAsBoze(done, test, setup.browser, "https://user.pocci.test")

