###global describe, it, before, beforeEach, after###
###jshint quotmark:true###
###jshint unused:false###
"use strict"

assert = require("chai").assert
fs = require("fs")
path = require("path")
jenkinsLib = require("jenkins")
thunkify = require("thunkify")
jenkins = require("pocci/jenkins.js")
yaml = require("pocci/yaml.js")
webdriver = require("pocci/webdriver.js")
test = require("./resq.js")
version = require("pocci/workspaces-version.json")


listNodes = ->
  jenkinsLibObj = jenkinsLib("http://jenkinsci:password@" + process.env.JENKINS_HOST)
  listJenkinsNodes = thunkify(jenkinsLibObj.node.list.bind(jenkinsLibObj.node))

  nodes = yield listJenkinsNodes()
  nodes.sort((a, b) -> return a.displayName - b.displayName)

  jenkinsNodes = []
  for node in nodes
    if node.displayName isnt "master"
      jenkinsNodes.push(node.displayName)

  return jenkinsNodes

assertEntries = (options) ->
  config = yaml("./config/workspaces.yml")

  options.nodes.sort()
  nodes = yield listNodes()
  console.log(nodes.length + ":" + options.nodes.length)
  assert.equal(nodes.length, options.nodes.length)
  assert.equal(nodes.length, Object.keys(config).length)

  for node, i in options.nodes
    console.log("#{node} : #{nodes[i]}")
    assert.equal(node, nodes[i])
    assert.equal(config[node].image, "xpfriend/workspace-#{node}:#{version[node]}")


destroyNodes = ->
  jenkinsLibObj = jenkinsLib("http://jenkinsci:password@" + process.env.JENKINS_HOST)
  destroyNode = thunkify(jenkinsLibObj.node.destroy.bind(jenkinsLibObj.node))
  nodes = yield listNodes()
  for node in nodes
    yield destroyNode(node)


describe "Jenkins", ->
  browser = null
  @timeout(120000)

  before (done) ->
    test done,
      setup: ->
        yield webdriver.init()
        browser = webdriver.browser
        return

  beforeEach (done) ->
    test done,
      setup: ->
        try
          fs.unlinkSync("./config/workspaces.yml")
        catch err

        yield destroyNodes()

  after (done) ->
    test done,
      cleanup: ->
        yield browser.end()

  it "creates a node", (done) ->
    test done,
      setup: ->
        yamlFile = path.resolve(__dirname, "jenkinsTest-01.yml")
        @options = yaml(yamlFile)
        return
      when: ->
        yield jenkins.setup(browser, @options)
      then: ->
        yield assertEntries(@options.jenkins)


  it "creates 2 nodes", (done) ->
    test done,
      setup: ->
        yamlFile = path.resolve(__dirname, "jenkinsTest-02.yml")
        @options = yaml(yamlFile)
        return
      when: ->
        console.log(jenkins)
        yield jenkins.setup(browser, @options)
      then: ->
        yield assertEntries(@options.jenkins)
