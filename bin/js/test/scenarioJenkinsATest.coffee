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
        assert.notOk(yield browser.isExisting("table"))

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
        assert.ok(yield browser.isExisting("table"))

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

  it "kanban - signin", (done) ->
    test done,
      setup: ->
        yield browser
          .url(process.env.KANBAN_URL + "/")
          .save("kanban-before-Oauth")
          .click("[data-ng-click='oauth()']")
          .pause(10000)
          .save("kanban-after-Oauth")

  it "kanban - close an issue", (done) ->
    test done,
      when: ->
        yield browser
          .url(process.env.KANBAN_URL + "/boards/example/example-java")
          .pause(2000)
          .save("kanban-before-close-issue")

        assert.equal((yield browser.getText("div[data-ng-repeat] a")).length, 2)
        yield browser
          .click("div[data-ng-repeat]:last-child a")
          .pause(2000)
          .save("kanban-doing-close-issue")
        assert.match(yield browser.getHTML("h3.subheader"), /import example codes/)

        yield browser
          .click("a[data-ng-click='remove(card)']")
          .pause(2000)
          .save("kanban-after-close-issue")

      then: ->
        assert.equal((yield browser.getText("div[data-ng-repeat] a")), "Issue #2")

  it "kanban - assert stages", (done) ->
    test done,
      when: ->
        stages = yield browser
          .url(process.env.KANBAN_URL + "/boards/example/example-java")
          .save("kanban-assert-stages")
          .getText("h4")
        assert.equal(stages.length, 4)
        assert.match(stages[0], /BACKLOG/)
        assert.match(stages[1], /TODO/)
        assert.match(stages[2], /DOING/)
        assert.match(stages[3], /DONE/)

  ###
  it "kanban - move an issue", (done) ->
    test done,
      when: ->
        yield browser
          .url(process.env.KANBAN_URL + "/boards/example/example-java")
          .pause(2000)
          .save("kanban-before-move-issue")
          .dragAndDrop(
              "div[data-as-sortable-item-handle]", 
              "div.stage-container:nth-child(2) div.stage div[data-as-sortable]")
          .pause(2000)
          .save("kanban-after-move-issue")

      then: ->
        assert.ok(yield browser.isExisting("div.stage-container:nth-child(2) div.stage div[data-as-sortable] div"))
  ###
