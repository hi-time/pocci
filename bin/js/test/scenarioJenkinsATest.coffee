###global describe, it, before, after###
###jshint quotmark:true###
"use strict"

assert = require("chai").assert
fs = require("fs")
webdriver = require("pocci/webdriver.js")
test = require("./resq.js")
scenarioTest = require("./scenarioTest.js")

describe "Scenario A (jenkins)", ->
  @timeout(10 * 60 * 1000)
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

  it "user - login as boze", (done) ->
    scenarioTest.user.loginAsBoze(done, test, browser)

  it "user - change password", (done) ->
    scenarioTest.user.changePassword(done, test, browser)

  it "gitlab - signin as boze", (done) ->
    scenarioTest.gitlab.signinAsBoze(done, test, browser)

  it "gitlab - add ssh key", (done) ->
    test done,
      setup: ->
        yield browser.url(process.env.GITLAB_URL + "/profile/keys")
        assert.isNotOk(yield browser.isExisting("table"))

      when: ->
        text = fs.readFileSync("/tmp/user_home/.ssh/id_rsa.pub", "utf8").replace("\n", "")
        yield browser
          .url(process.env.GITLAB_URL + "/profile/keys/new")
          .save("gitlab-before-add-ssh-key")
          .setValue("#key_key", text)
          .click("#key_title")
          .save("gitlab-doing-add-ssh-key")
          .click("input[name='commit']")
          .save("gitlab-after-add-ssh-key")

      then: ->
        yield browser.url(process.env.GITLAB_URL + "/profile/keys")
        assert.isOk(yield browser.isExisting("table"))

  it "gitlab - assert repository url", (done) ->
    test done,
      when: ->
        yield browser.url(process.env.GITLAB_URL + "/example/example-java")

      then: ->
        assert.equal(
          yield browser.getValue("#project_clone"),
          "ssh://git@gitlab.pocci.test:10022/example/example-java.git")

  it "gitlab - add an issue", (done) ->
    test done,
      when: ->
        yield browser
          .url(process.env.GITLAB_URL + "/example/example-java/issues/new")
          .save("gitlab-before-add-issue")
          .setValue("#issue_title", "Improve the code")
          .save("gitlab-doing-add-issue")
          .click("input[name='commit']")
          .save("gitlab-after-add-issue")

      then: ->
        href = (yield browser
          .url(process.env.GITLAB_URL + "/example/example-java/issues")
          .getAttribute("ul.issues-list a.row_title", "href"))[0]

        yield browser.url(href).save("gitlab-after-add-issue")
        assert.equal(yield browser.getText(".author"), "BOZE, Taro")
        assert.equal(yield browser.getText(".issue-title"), "Improve the code")
