###jshint quotmark:true###
"use strict"

assert = require("chai").assert
retry = require("co-retry")
jenkinsLib = require("jenkins")
thunkify = require("thunkify")
test = require("./resq.js")

jenkins = jenkinsLib("http://jenkinsci:password@" + process.env.JENKINS_HOST)
build = thunkify(jenkins.job.build.bind(jenkins.job))
get = thunkify(jenkins.job.get.bind(jenkins.job))

assertNotBuilt = (name) ->
  data = yield get(name)
  assert.equal(data.name, name)
  assert.equal(data.color, "notbuilt")
  assert.equal(data.builds.length, 0)

assertBuilt = (name) ->
  data = yield get(name)
  if data.color is "notbuilt" or data.color is "notbuilt_anime"
    throw new Error("job:#{name}, color:#{data.color}")

assertBlue = (name) ->
  data = yield get(name)
  assert.equal(data.color, "blue")

module.exports =
  buildJob : (name) ->
    yield assertNotBuilt(name)
    yield build(name)
    console.log("    start : #{name}")
    yield retry(assertBuilt.bind(this, name), {retries: 100, interval: 10000, factor : 1})
    console.log("    end   : #{name}")
    yield assertBlue(name)
