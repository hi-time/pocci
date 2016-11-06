###global describe, it, before, after###
###jshint quotmark:true###
"use strict"

assert = require("chai").assert
setup = require("pocci/setup.js")
test = require("./resq.js")
loginNexus = require("./loginTest.js").loginNexus

describe "setup.redmine.yml +nexus +proxy -redmine", ->
  @timeout(10 * 60 * 1000)

  before (done) ->
    test done,
      setup: ->
        yield setup.initBrowser()

  after (done) ->
    test done,
      cleanup: ->
        yield setup.browser.end()

  it "pocci", (done) ->
    test done,
      expect: ->
        yield @assert
          nexus:
            path:   "http://nexus.pocci.test"
            expected:
              "title":   "Nexus Repository Manager"
          redmine:
            path:   "http://redmine.pocci.test"
            thrown:
              "code": "ENOTFOUND"
              "hostname": "redmine.pocci.test"


  it "proxy", (done) ->
    browser = setup.browser
    test done,
      when: ->
        yield loginNexus(browser)
        yield browser
          .url("http://nexus.pocci.test/#admin/system/http")
          .pause(2000)
          .save("nexus-proxy-config")
      then: ->
        host = yield browser.getValue("input[name='httpHost']")
        port = yield browser.getValue("input[name='httpPort']")
        assert.equal(host, "172.20.0.253")
        assert.equal(port, "8888")
  