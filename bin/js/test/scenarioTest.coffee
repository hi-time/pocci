###jshint quotmark:true###
###jshint eqnull:true###
"use strict"

assert = require("chai").assert

module.exports.user =
  loginAsBoze: (done, test, browser, url = process.env.USER_URL) ->
    test done,
      when: ->
        yield browser
          .url(url)
          .save("user-not-admin-berore-autherize")
          .setValue("#login-cn", "boze")
          .setValue("#login-userPassword", "password")
          .save("user-not-admin-doing-autherize")
          .click("#login button")
          .save("user-not-admin-after-autherize")

      then: ->
        assert.isOk(yield browser.isEnabled("#userPassword"))
        assert.isNotOk(yield browser.isExisting("#search-form"))

  changePassword: (done, test, browser) ->
    test done,
      when: ->
        yield browser
          .setValue("#userPassword", "abcd1234")
          .save("user-before-change-password")
          .click("#user-form button[type='submit']")
          .save("user-after-change-password")

      then: ->
        assert.isOk(yield browser.isVisible("#login-cn"))

module.exports.gitlab =
  signinAsBoze: (done, test, browser) ->
    test done,
      when: ->
        yield browser
          .url(process.env.GITLAB_URL + "/users/sign_in")
          .save("gitlab-before-signin")
          .setValue("#username", "boze")
          .setValue("#password", "abcd1234")
          .save("gitlab-doing-signin")
          .submitForm("#new_ldap_user")
          .save("gitlab-after-signin")

      then: ->
        text = yield browser
          .url(process.env.GITLAB_URL + "/profile/")
          .save("gitlab-assert-signin")
          .getValue("#user_name")
        assert.equal(text, "BOZE, Taro")
