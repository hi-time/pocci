###global describe, it###
###jshint quotmark:true###
"use strict"

path = require("path")
setup = require("../lib/setup.js")
test = require("./resq.js")
chai = require("chai")
LdapClient = require("promised-ldap")

describe "setup.default.yml", ->
  @timeout(10 * 60 * 1000)

  it "gitlab", (done) ->
    test done,
      setup: ->
        gitlab = setup.gitlab
        url = "http://gitlab.pocci.test"
        yield setup.initBrowser()
        yield gitlab.loginByAdmin(setup.browser, url)
        @request = yield gitlab.createRequest(setup.browser, url)
        yield gitlab.logout(setup.browser)

      expect: ->
        @groupId = yield @get("body[0].id@/groups?search=example", true)
        @projectIdGuide = yield @get("body[0].id@/projects/search/users-guide", true)
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
              "body.length":            3
              "body[0].id":             @projectIdGuide
              "body[0].name":           "users-guide"
              "body[0].public":         true
              "body[0].namespace.id":   @groupId
              "body[0].namespace.name": "example"
              "body[1].id":             @projectIdJava
              "body[1].name":           "example-java"
              "body[1].public":         true
              "body[1].namespace.id":   @groupId
              "body[1].namespace.name": "example"
              "body[2].id":             @projectIdNode
              "body[2].name":           "example-nodejs"
              "body[2].public":         true
              "body[2].namespace.id":   @groupId
              "body[2].namespace.name": "example"

          projectGuideFiles:
            path: "/projects/#{@projectIdGuide}/repository/tree"
            sort:   {target: "body", keys: "name"}
            expected:
              "body.length":          2
              "body[0].name":        "README.md"
              "body[1].name":        "images"

          projectGuideIssues:
            path: "/projects/#{@projectIdGuide}/issues"
            expected:
              "body.length":          0

          projectGuideLabels:
            path: "/projects/#{@projectIdGuide}/labels"
            expected:
              "body.length":          0

          projectGuideHooks:
            path: "/projects/#{@projectIdGuide}/hooks"
            expected:
              "body.length":          0

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
              "body.length":          1
              "body[0].iid":          1
              "body[0].title":        "import example codes"
              "body[0].description":  null

          projectJavaLabels:
            path: "/projects/#{@projectIdJava}/labels"
            sort:   {target: "body", keys: "name"}
            expected:
              "body.length":          4
              "body[0].name":         "KB[stage][0][BACKLOG]"
              "body[0].color":        "#F5F5F5"
              "body[1].name":         "KB[stage][1][TODO]"
              "body[1].color":        "#F5F5F5"
              "body[2].name":         "KB[stage][2][DOING]"
              "body[2].color":        "#F5F5F5"
              "body[3].name":         "KB[stage][3][DONE]"
              "body[3].color":        "#F5F5F5"

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
              "body.length":          1
              "body[0].iid":          1
              "body[0].title":        "import example codes"
              "body[0].description":  null

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

  it "pocci", (done) ->
    test done,
      expect: ->
        yield @assert
          sonar:
            path:   "http://sonar.pocci.test"
            expected:
              "h1":   "Home"
          kanban:
            path:   "http://kanban.pocci.test"
            expected:
              "title":   "Gitlab KB - Boards"
          redmine:
            path:   "http://redmine.pocci.test"
            thrown:
              "code": "ENOTFOUND"
              "hostname": "redmine.pocci.test"
        chai.assert.equal(process.env.TZ, "Asia/Tokyo")

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
        chai.assert.equal(attrs[0].mail, "jenkins-ci@example.com")
        chai.assert.equal(attrs[0].labeledURI, "https://wiki.jenkins-ci.org/download/attachments/2916393/headshot.png")
        chai.assert.match(attrs[0].userPassword, /^{SSHA}.+/)

        chai.assert.equal(attrs[1].uid, "boze")
        chai.assert.equal(attrs[1].cn, "boze")
        chai.assert.equal(attrs[1].sn, "BOZE")
        chai.assert.equal(attrs[1].givenName, "Taro")
        chai.assert.equal(attrs[1].displayName, "BOZE, Taro")
        chai.assert.equal(attrs[1].mail, "boze@example.com")
        chai.assert.equal(attrs[1].labeledURI, undefined)
        chai.assert.match(attrs[1].userPassword, /^{SSHA}.+/)
        


