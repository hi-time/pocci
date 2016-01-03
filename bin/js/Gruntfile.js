'use strict';
module.exports = function(grunt) {
  grunt.initConfig({
    coffee: {
      lib: {
        expand: true,
        cwd: 'lib',
        src: ['*.coffee'],
        dest: 'lib',
        ext: '.js'
      },
      test: {
        expand: true,
        cwd: 'test',
        src: ['*.coffee'],
        dest: 'test',
        ext: '.js'
      },
    },
    jshint: {
      all: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: ['Gruntfile.js', 'app.js', 'lib/**/*.js', 'node_modules/pocci/*.js', 'test/**/*.js']
      }
    },
    clean: ['config'],
    mochaTest: {
      all: {
        src: ['test/*.js']
      },
      ldap: {
        src: ['test/ldapTest.js']
      },
      gitlab: {
        src: ['test/gitlabTest.js']
      },
      jenkins: {
        src: ['test/jenkinsTest.js']
      },
      git: {
        src: ['test/gitTest.js']
      },
      login: {
        src: ['test/loginTest.js']
      },
      loginDefault: {
        src: ['test/loginTest-default.js']
      },
      loginJenkins: {
        src: ['test/loginTest-jenkins.js']
      },
      loginRedmine: {
        src: ['test/loginTest-redmine.js']
      },
      jenkinsJavaBuild: {
        src: ['test/jenkinsJavaBuildTest.js']
      },
      jenkinsNodeJSBuild: {
        src: ['test/jenkinsNodeJSBuildTest.js']
      },
      defaultSetup: {
        src: ['test/defaultSetupTest.js']
      },
      jenkinsSetup: {
        src: ['test/jenkinsSetupTest.js']
      },
      redmineSetup: {
        src: ['test/redmineSetupTest.js']
      },
      scenarioJenkinsA: {
        src: ['test/scenarioJenkinsATest.js']
      },
      scenarioRedmineA: {
        src: ['test/scenarioRedmineATest.js']
      },
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.registerTask('mkdir',
    function() {
      require('fs').mkdir('config');
    }
  );

  grunt.registerTask('default', ['coffee', 'jshint']);
  grunt.registerTask('prepare', ['clean', 'mkdir']);
  grunt.registerTask('basic', ['default', 'prepare']);
  grunt.registerTask('ldap', ['basic', 'mochaTest:ldap']);
  grunt.registerTask('jenkins', ['basic', 'mochaTest:jenkins']);
  grunt.registerTask('git', ['basic', 'mochaTest:git']);
};
