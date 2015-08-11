###global describe, it, before, after###
###jshint quotmark:true###
"use strict"

assert = require("chai").assert
co = require("co")
retry = require("co-retry")
jenkinsLib = require("jenkins")
thunkify = require("thunkify")
webdriver = require("../lib/webdriver.js")
test = require("./resq.js")

describe "Login", () ->
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


  it "ldap", (done) ->
    test done,
      when: ->
        browser
          .url(process.env.USER_URL + "/cmd.php?cmd=login_form")
          .setValue("#login", "cn=admin,dc=example,dc=com")
          .setValue("#password", "admin")
          .submitForm("form")

        yield browser.yieldable.call()

      then: ->
        browser.url(process.env.USER_URL + "/")
        text = (yield browser.yieldable.getText("td.logged_in"))[0]
        assert.equal(text, "Logged in as: cn=admin")


  it "jenkins", (done) ->
    test done,
      when: ->
        browser
          .url(process.env.JENKINS_URL + "/login")
          .setValue("#j_username", "bouze")
          .setValue("input[type='password'][name='j_password']", "password")

        yield browser.yieldable.call()
        yield browser.yieldable.click("button")

      then: ->
        browser.url(process.env.JENKINS_URL + "/")
        text = (yield browser.yieldable.getText("#header div.login a[href='/user/bouze'] > b"))[0]
        assert.equal(text, "bouze")


  it "sonar", (done) ->
    test done,
      when: ->
        browser
          .url(process.env.SONAR_URL + "/sessions/new")
          .setValue("#login", "jenkinsci")
          .setValue("#password", "password")
          .submitForm("form")

        yield browser.yieldable.call()
      then: ->
        browser.url(process.env.SONAR_URL + "/")
        browser.pause(1000)
        text = (yield browser.yieldable.getText("nav"))[0]
        assert.ok(text.indexOf("jenkinsci") > -1)


  it "gitlab", (done) ->
    loginGitHub = ->
      browser
        .url(process.env.GITLAB_URL + "/users/sign_in")
        .setValue("#username", "bouze")
        .setValue("#password", "password")
        .submitForm("#new_ldap_user")

      yield browser.yieldable.call()

      browser.url(process.env.GITLAB_URL + "/profile/")
      text = (yield browser.yieldable.getValue("#user_name"))[0]
      assert.equal(text, "bouze")

    test done,
      expect: ->
        yield loginGitHub()


describe "Jenkins Job", ->

  it "build", (done) ->
    @timeout(30 * 60 * 1000)
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

    buildJob = (name) ->
      yield assertNotBuilt(name)
      yield build(name)
      console.log("    start : #{name}")
      yield retry(assertBuilt.bind(this, name), {retries: 100, interval: 10000, factor : 1})
      console.log("    end   : #{name}")
      yield assertBlue(name)

    test done,
      expect: ->
        yield buildJob("example-java")
        yield buildJob("example-nodejs")
