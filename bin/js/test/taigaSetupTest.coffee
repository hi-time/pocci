###global describe, it, before, after###
###jshint quotmark:true###
"use strict"

path = require("path")
setup = require("pocci/setup.js")
gitlab = require("pocci/gitlab.js")
taiga = require("pocci/taiga.js")
test = require("./resq.js")
chai = require("chai")
LdapClient = require("promised-ldap")

createTaigaRequest = () ->
  yield taiga.createRequest "http://taiga.pocci.test", 
      uid: "boze"
      userPassword: "password"

describe "setup.taiga.yml", ->
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
        @request = yield createTaigaRequest()
        taigaProjectId = yield @get("body.id@/projects/by_slug?slug=boze-example", true)
        @hookUrl = yield @get("body.gitlab.webhooks_url@/projects/#{taigaProjectId}/modules", true)

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
              "body[1].username":     "boze"
              "body[1].name":         "BOZE, Taro"
              "body[1].access_level": 50
              "body[2].username":     "hamada"
              "body[2].name":         "HAMADA, Kawao"
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
              "body.length":          3
              "body[0].name":        "README.en.md"
              "body[1].name":        "README.ja.md"
              "body[2].name":        "images"

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
              "body.length":                  1
              "body[0].url":                  @hookUrl
              "body[0].push_events":          true
              "body[0].issues_events":        true
              "body[0].note_events":          true
              "body[0].merge_requests_events":false
              "body[0].tag_push_events":      false

          projectJavaFiles:
            path: "/projects/#{@projectIdJava}/repository/tree"
            sort:   {target: "body", keys: "name"}
            expected:
              "body.length":         5
              "body[0].name":        ".gitignore"
              "body[1].name":        ".gitlab-ci.yml"
              "body[2].name":        "build.sh"
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
            expected:
              "body.length":          0

          projectJavaHooks:
            path: "/projects/#{@projectIdJava}/hooks"
            expected:
              "body.length":                  1
              "body[0].url":                  @hookUrl
              "body[0].push_events":          true
              "body[0].issues_events":        true
              "body[0].note_events":          true
              "body[0].merge_requests_events":false
              "body[0].tag_push_events":      false

          projectNodeFiles:
            path: "/projects/#{@projectIdNode}/repository/tree"
            sort:   {target: "body", keys: "name"}
            expected:
              "body.length":         9
              "body[0].name":        ".gitignore"
              "body[1].name":        ".gitlab-ci.yml"
              "body[2].name":        "Gruntfile.js"
              "body[3].name":        "app"
              "body[4].name":        "bower.json"
              "body[5].name":        "build.sh"
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
              "body.length":                  1
              "body[0].url":                  @hookUrl
              "body[0].push_events":          true
              "body[0].issues_events":        true
              "body[0].note_events":          true
              "body[0].merge_requests_events":false
              "body[0].tag_push_events":      false

        yield @assert
          runners:
            path:   "/runners/all"
            expected:
              "body.length":  1

  it "pocci", (done) ->
    test done,
      expect: ->
        yield @assert
          sonar:
            path:   "http://sonar.pocci.test"
            expected:
              "h1":   "Home"
          taiga:
            path:   "http://taiga.pocci.test"
            expected:
              "title":   "Taiga"
          jenkins:
            path:   "http://jenkins.pocci.test"
            thrown:
              "code": "ENOTFOUND"
              "hostname": "jenkins.pocci.test"
          redmine:
            path:   "http://redmine.pocci.test"
            thrown:
              "code": "ENOTFOUND"
              "hostname": "redmine.pocci.test"
        chai.assert.equal(process.env.TZ, "Etc/UTC")

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
        chai.assert.equal(attrs[0].uid, "boze")
        chai.assert.equal(attrs[0].cn, "boze")
        chai.assert.equal(attrs[0].sn, "BOZE")
        chai.assert.equal(attrs[0].givenName, "Taro")
        chai.assert.equal(attrs[0].displayName, "BOZE, Taro")
        chai.assert.equal(attrs[0].mail, "boze@localhost.localdomain")
        chai.assert.equal(attrs[0].labeledURI, "file:///users/boze.png")
        chai.assert.match(attrs[0].userPassword, /^{SSHA}.+/)

        chai.assert.equal(attrs[1].uid, "hamada")
        chai.assert.equal(attrs[1].cn, "hamada")
        chai.assert.equal(attrs[1].sn, "HAMADA")
        chai.assert.equal(attrs[1].givenName, "Kawao")
        chai.assert.equal(attrs[1].displayName, "HAMADA, Kawao")
        chai.assert.equal(attrs[1].mail, "hamada@localhost.localdomain")
        chai.assert.equal(attrs[1].labeledURI, "file:///users/hamada.png")
        chai.assert.match(attrs[1].userPassword, /^{SSHA}.+/)

  it "taiga", (done) ->
    test done,
      setup: ->
        @request = yield createTaigaRequest()
        return

      expect: ->
        @taigaProjectId = yield @get("body.id@/projects/by_slug?slug=boze-example", true)

        yield @assert
          projects:
            path: "/projects"
            expected:
              "body.length":            1
              "body[0].name":           "example"
              "body[0].description":    "example project"
              "body[0].slug":           "boze-example"
              "body[0].owner.username": "boze"
              "body[0].members.length": 2

          users:
            path: "/users"
            sort:   {target: "body", keys: "id"}
            expected:
              "body.length":            2
              "body[0].username":       "boze"
              "body[0].full_name":      "BOZE, Taro"
              "body[0].is_active":      true
              "body[0].photo":          /boze.png/
              "body[0].big_photo":      /boze.png/
              "body[0].roles.length":   1
              "body[0].roles[0]":       "Product Owner"
              "body[0].projects_with_me.length":    1
              "body[0].projects_with_me[0].slug":   "boze-example"
              "body[0].projects_with_me[0].name":   "example"
              "body[1].username":       "hamada"
              "body[1].full_name":      "HAMADA, Kawao"
              "body[1].is_active":      true
              "body[1].photo":          /hamada.png/
              "body[1].big_photo":      /hamada.png/
              "body[1].roles.length":   1
              "body[1].roles[0]":       "Product Owner"
              "body[1].projects_with_me.length":    1
              "body[1].projects_with_me[0].slug":   "boze-example"
              "body[1].projects_with_me[0].name":   "example"

          memberships:
            path: "/memberships"
            sort:   {target: "body", keys: "id"}
            expected:
              "body.length":            2
              "body[0].project_name":   "example"
              "body[0].full_name":      "BOZE, Taro"
              "body[0].role_name":      "Product Owner"
              "body[0].is_owner":       true
              "body[0].is_admin":       true
              "body[0].invited_by":     null
              "body[1].project_name":   "example"
              "body[1].full_name":      "HAMADA, Kawao"
              "body[1].role_name":      "Product Owner"
              "body[1].is_owner":       false
              "body[1].is_admin":       false
              "body[1].invited_by.username": "boze"
