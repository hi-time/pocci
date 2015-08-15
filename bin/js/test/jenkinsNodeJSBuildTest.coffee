###global describe, it###
###jshint quotmark:true###
"use strict"

jenkinsBuild = require("./jenkinsBuild.js")
test = require("./resq.js")

describe "Jenkins Job (example-nodejs)", ->

  it "build", (done) ->
    @timeout(30 * 60 * 1000)

    test done,
      expect: ->
        yield jenkinsBuild.buildJob("example-nodejs")
