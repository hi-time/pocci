'use strict';
module.exports = function(grunt) {
  grunt.initConfig({
    karma: {
      singleRun: {
        options: {
          configFile: 'karma.conf.js',
          singleRun: true
        }
      }
    },
    sonarRunner: {
      analysis: {
        options: {
          debug: true,
          separator: '\n',
          sonar: {
            host: {
              url: process.env.SONAR_URL
            },
            javascript: {
              lcov: {
                reportPath: './coverage/lcov.info'
              }
            },
            projectKey: 'example-nodejs:1.0.0',
            projectName: 'example-nodejs',
            projectVersion: '1.0.0',
            sources: ['app'].join(','),
            language: 'js',
            sourceEncoding: 'UTF-8'
          }
        }
      }
    }


  });
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-sonar-runner');

  grunt.registerTask('default', ['karma:singleRun', 'sonarRunner:analysis']);
};
