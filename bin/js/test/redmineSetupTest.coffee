###global describe, it, before, after###
###jshint quotmark:true###
"use strict"

path = require("path")
setup = require("pocci/setup.js")
gitlab = require("pocci/gitlab.js")
redmine = require("pocci/redmine.js")
test = require("./resq.js")
chai = require("chai")
LdapClient = require("promised-ldap")

describe "setup.redmine.yml", ->
  @timeout(10 * 60 * 1000)
  
  before (done) ->
    test done,
      setup: ->
        yield setup.initBrowser()
  
  after (done) ->
    test done,
      cleanup: ->
        yield setup.browser.end()
  
  it "gitlab", (done) ->
    test done,
      setup: ->
        @url = "http://gitlab.pocci.test"
        yield gitlab.loginByAdmin(setup.browser, @url)
        @request = yield gitlab.createRequest(setup.browser, @url)
        yield gitlab.logout(setup.browser)

      expect: ->
        @groupId = yield @get("body[0].id@/groups?search=example", true)
        @projectIdJava = yield @get("body[0].id@/projects/search/example-java", true)
        @projectIdNode = yield @get("body[0].id@/projects/search/example-nodejs", true)

        yield @assert
          group:
            path:   "/groups"
            expected:
              "body.length":  1
              "body[0].id":   @groupId
              "body[0].name": "example"

          members:
            path:   "/groups/#{@groupId}/members"
            sort:   {target: "body", keys: "id"}
            expected:
              "body.length":          3
              "body[0].username":     "root"
              "body[0].name":         "Administrator"
              "body[0].access_level": 50
              "body[1].username":     "jenkinsci"
              "body[1].name":         "Jenkins"
              "body[1].access_level": 50
              "body[2].username":     "boze"
              "body[2].name":         "BOZE, Taro"
              "body[2].access_level": 50

          projects:
            path:   "/projects"
            sort:   {target: "body", keys: "id"}
            expected:
              "body.length":            2
              "body[0].id":             @projectIdJava
              "body[0].name":           "example-java"
              "body[0].public":         true
              "body[0].namespace.id":   @groupId
              "body[0].namespace.name": "example"
              "body[1].id":             @projectIdNode
              "body[1].name":           "example-nodejs"
              "body[1].public":         true
              "body[1].namespace.id":   @groupId
              "body[1].namespace.name": "example"

          projectJavaFiles:
            path: "/projects/#{@projectIdJava}/repository/tree"
            sort:   {target: "body", keys: "name"}
            expected:
              "body.length":         5
              "body[0].name":        ".gitignore"
              "body[1].name":        "build.sh"
              "body[2].name":        "jenkins-config.xml"
              "body[3].name":        "pom.xml"
              "body[4].name":        "src"

          projectJavaIssues:
            path: "/projects/#{@projectIdJava}/issues"
            expected:
              "body.length":          0

          projectJavaLabels:
            path: "/projects/#{@projectIdJava}/labels"
            sort:   {target: "body", keys: "name"}
            expected:
              "body.length":          0

          projectJavaHooks:
            path: "/projects/#{@projectIdJava}/hooks"
            expected:
              "body.length":          1
              "body[0].url":          "http://jenkins.pocci.test/project/example-java"
              "body[0].push_events":          true
              "body[0].issues_events":        false
              "body[0].merge_requests_events":true
              "body[0].tag_push_events":      false

          projectNodeFiles:
            path: "/projects/#{@projectIdNode}/repository/tree"
            sort:   {target: "body", keys: "name"}
            expected:
              "body.length":         9
              "body[0].name":        ".gitignore"
              "body[1].name":        "Gruntfile.js"
              "body[2].name":        "app"
              "body[3].name":        "bower.json"
              "body[4].name":        "build.sh"
              "body[5].name":        "jenkins-config.xml"
              "body[6].name":        "karma.conf.js"
              "body[7].name":        "package.json"
              "body[8].name":        "test"

          projectNodeIssues:
            path: "/projects/#{@projectIdNode}/issues"
            expected:
              "body.length":          0

          projectNodeLabels:
            path: "/projects/#{@projectIdNode}/labels"
            expected:
              "body.length":          0

          projectNodeHooks:
            path: "/projects/#{@projectIdNode}/hooks"
            expected:
              "body.length":          1
              "body[0].url":          "http://jenkins.pocci.test/project/example-nodejs"
              "body[0].push_events":          true
              "body[0].issues_events":        false
              "body[0].merge_requests_events":true
              "body[0].tag_push_events":      false

        yield gitlab.login(setup.browser, @url, "jenkinsci", "password")
        src = yield setup.browser
          .save("gitlab-login-by-jenkinsci")
          .getAttribute("img.header-user-avatar", "src")
        yield gitlab.logout(setup.browser)
        chai.assert.isOk(src.indexOf("jenkinsci.png") > -1, "Invalid avatar of jenkinsci")


  it "pocci", (done) ->
    test done,
      expect: ->
        yield @assert
          sonar:
            path:   "http://sonar.pocci.test"
            expected:
              "title":   "SonarQube"
          redmine:
            path:   "http://redmine.pocci.test"
            expected:
              "title":   "Redmine"
          taiga:
            path:   "http://taiga.pocci.test"
            thrown:
              "code": "ENOTFOUND"
              "hostname": "taiga.pocci.test"
        chai.assert.equal(process.env.TZ, "Etc/UTC")

  it "jenkins", (done) ->
    test done,
      setup: ->
        url = "http://jenkins.pocci.test"
        @request = (path) ->
          url: url + path + "/api/json"
          json: true
        return

      expect: ->
        yield @assert
          jobs:
            path:   ""
            debug: true
            expected:
              "body.jobs.length":   2
              "body.jobs[0].name":  "example-java"
              "body.jobs[0].url":   "http://jenkins.pocci.test/job/example-java/"
              "body.jobs[1].name":  "example-nodejs"
              "body.jobs[1].url":   "http://jenkins.pocci.test/job/example-nodejs/"

          nodes:
            path:   "/computer"
            expected:
              "body.computer.length":   3
              "body.computer[0].displayName":     "master"
              "body.computer[0].offline":         false
              "body.computer[1].displayName":     "java"
              "body.computer[1].offline":         false
              "body.computer[2].displayName":     "nodejs"
              "body.computer[2].offline":         false

  it "user", (done) ->
    test done,
      expect: ->
        client = new LdapClient({url: "ldap://user.pocci.test"})
        dn = "cn=admin,dc=example,dc=com"
        yield client.bind(dn, "admin")
        result = yield client.search "dc=example,dc=com",
          scope: "one"
          filter: "(uid=*)"
        chai.assert.equal(result.entries.length, 2)

        attrs = []
        for entry in result.entries
          obj = {}
          for attribute in entry.attributes
            obj[attribute.type] = attribute.vals[0]
          attrs.push(obj)

        console.log(attrs)
        chai.assert.equal(attrs[0].uid, "jenkinsci")
        chai.assert.equal(attrs[0].cn, "jenkinsci")
        chai.assert.equal(attrs[0].sn, "CI")
        chai.assert.equal(attrs[0].givenName, "Jenkins")
        chai.assert.equal(attrs[0].displayName, "Jenkins")
        chai.assert.equal(attrs[0].mail, "jenkins-ci@localhost.localdomain")
        chai.assert.equal(attrs[0].labeledURI, "https://wiki.jenkins-ci.org/download/attachments/2916393/headshot.png")
        chai.assert.match(attrs[0].userPassword, /^{SSHA}.+/)

        chai.assert.equal(attrs[1].uid, "boze")
        chai.assert.equal(attrs[1].cn, "boze")
        chai.assert.equal(attrs[1].sn, "BOZE")
        chai.assert.equal(attrs[1].givenName, "Taro")
        chai.assert.equal(attrs[1].displayName, "BOZE, Taro")
        chai.assert.equal(attrs[1].mail, "boze@localhost.localdomain")
        chai.assert.equal(attrs[1].labeledURI, undefined)
        chai.assert.match(attrs[1].userPassword, /^{SSHA}.+/)

  it "redmine", (done) ->
    url = "http://redmine.pocci.test"
    test done,
      setup: ->
        yield redmine.loginByAdmin(setup.browser, url)
        return

      cleanup: ->
        yield redmine.logout(setup.browser)

      expect: ->
        @request = (path) ->
          url: url + path

        @revisionJava = yield @get(".changeset a@/projects/example/repository", true)
        @revisionNode = yield @get(".changeset a@/projects/example/repository/example-nodejs", true)

        yield @assert
          repositoryJava:
            path: "/projects/example/repository"
            expected:
              "h2": /example-java[\s\S]*@[\s\S]*master/
              "a[href='/issues/1']": "#1"
          repositoryNode:
            path: "/projects/example/repository/example-nodejs"
            expected:
              "h2": /example-nodejs[\s\S]*@[\s\S]*master/
              "a[href='/issues/1']": "#1"
          issueJava:
            path: "/issues/1"
            expected:
              "#issue-changesets .changeset.odd a": new RegExp(@revisionJava)
          issueNode:
            path: "/issues/1"
            expected:
              "#issue-changesets .changeset.even a": new RegExp(@revisionNode)

        @request = yield redmine.createRequest(setup.browser, url)
        yield @assert
          projects:
            path:   "/projects.json"
            expected:
              "body.total_count":             1
              "body.projects.length":         1
              "body.projects[0].id":          1
              "body.projects[0].name":        "example"
              "body.projects[0].identifier":  "example"

          users:
            path:   "/users.json"
            debug: true
            sort:   {target: "body.users", keys: "id"}
            expected:
              "body.total_count":             3
              "body.users.length":            3
              "body.users[0].login":          "admin"
              "body.users[0].firstname":      "Redmine"
              "body.users[0].lastname":       "Admin"
              "body.users[0].mail":           "pocci@localhost.localdomain"
              "body.users[1].login":          "jenkinsci"
              "body.users[1].firstname":      "Jenkins"
              "body.users[1].lastname":       "CI"
              "body.users[1].mail":           "jenkins-ci@localhost.localdomain"
              "body.users[2].login":          "boze"
              "body.users[2].firstname":      "Taro"
              "body.users[2].lastname":       "BOZE"
              "body.users[2].mail":           "boze@localhost.localdomain"

          issues:
            path:   "/issues.json"
            expected:
              "body.total_count":             1
              "body.issues.length":           1
              "body.issues[0].id":            1
              "body.issues[0].project.id":    1
              "body.issues[0].project.name":  "example"
              "body.issues[0].status.id":     1
              "body.issues[0].subject":       "import example codes"

          memberships:
            path:   "/projects/1/memberships.json"
            expected:
              "body.total_count":                   2
              "body.memberships.length":            2
              "body.memberships[0].user.name":      "Jenkins CI"
              "body.memberships[0].roles.length":   2
              "body.memberships[0].roles[0].id":    3
              "body.memberships[0].roles[1].id":    4
              "body.memberships[1].user.name":      "Taro BOZE"
              "body.memberships[1].roles.length":   2
              "body.memberships[1].roles[0].id":    3
              "body.memberships[1].roles[1].id":    4
              

  it "redmine (defalut user language)", (done) ->
    url = "http://redmine.pocci.test"
    test done,
      setup: ->
        yield redmine.login(setup.browser, url, "boze", "password")
        return

      cleanup: ->
        yield redmine.logout(setup.browser)

      expect: ->
        value = yield setup.browser.url("#{url}/my/account")
          .getText("#user_language [selected]")

        chai.assert.equal(value, "(auto)")
