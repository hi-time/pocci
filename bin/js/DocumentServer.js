'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    connect: {
      server: {
        options: {
          port: 9999,
          hostname: '*',
          base: '/tmp/html',
          keepalive: true
        }
      }
    },
    copy: {
      dist: {
        expand: true,
        cwd: '/app/document/',
        src: '**/*.css',
        dest: '/tmp/html/'
      }
    },
    markdown: {
      all: {
        files: [
          {
            expand: true,
            cwd: '/app/document/',
            src: '**/*.md',
            dest: '/tmp/html/',
            ext: '.html'
          }
        ],
        options: {
          template: '/app/document/template.html',
          markdownOptions: {
            gfm: true,
            highlight: 'manual'
          },
          postCompile : function(html, templateContext) {
            var $ = require('cheerio').load(html);
            templateContext.rooturl = '.';
            templateContext.title = $('h1').first().text() || $('h2').first().text() || $('h3').first().text();
            $('a').each(function(i, elem) {
              var href = $(this).attr('href');
              $(this).attr('href', href.replace(/\...\.md$/, '.html'));
            });
            return $.html();
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-markdown');

  grunt.registerTask('build', ['copy', 'markdown']);
  grunt.registerTask('default', ['build', 'connect']);
};
