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
        files: [
          {expand: true, cwd: '/app/', src: 'config.log', dest: '/tmp/html/', timestamp:true},
          {expand: true, cwd: '/app/bin/js/config/screen/', src: '*.png', dest: '/tmp/html/screen/', timestamp:true},
          {expand: true, cwd: '/app/document/', src: '**/*.css', dest: '/tmp/html/'}
        ]
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
            var addConfigLog = function(log) {
              var fs = require('fs');
              var logFile = '/tmp/html/config.log';
              if(!fs.existsSync(logFile)) {
                return;
              }
              var timestamp = fs.statSync(logFile).mtime.toLocaleString();
              log.append(
                '<h2>Setup Log</h2><ul>' + 
                '<li><a target="setup-log" href="/config.log">Log File - ' + timestamp + '</a></li>' +
                '<li><a href="/config-screen.html">Screen shots</a></li>' +
                '</ul>'
              );
            };

            var $ = require('cheerio').load(html);
            templateContext.rooturl = '.';
            templateContext.title = $('h1').first().text() || $('h2').first().text() || $('h3').first().text();
            $('a').each(function(i, elem) {
              var href = $(this).attr('href');
              $(this).attr('href', href.replace(/\...\.md$/, '.html'));
            });
            var log = $('#setup-log');
            if(log.length > 0) {
              addConfigLog(log);
            }
            return $.html();
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-markdown');

  grunt.registerTask('edit-screen-shot', function() {
    var fs = require('fs');
    var screenFile = '/tmp/html/config-screen.html';
    var screenDir = '/tmp/html/screen';
    if(!fs.existsSync(screenDir)) {
      fs.writeFileSync(screenFile, '<html><body></body></html>');
      return;
    }

    var template = fs.readFileSync('/app/document/template-screen.html', 'utf8');
    var $ = require('cheerio').load(template);
    var carousel = $('.carousel-inner');
    var files = fs.readdirSync(screenDir);
    for(var i = 0; i < files.length; i++) {
      if(files[i].indexOf('.png') > -1) {
        carousel.append(
        '<div class="item' + ((i === 0)?' active' : '') + '">' +
          '<img src="/screen/' + files[i] + '" alt="' + files[i] + '">' +
          '<div class="carousel-caption">' + files[i] + '</div>' +
        '</div>'
        );
      }
    }
    fs.writeFileSync(screenFile, $.html());
  });
  grunt.registerTask('build', ['copy', 'markdown', 'edit-screen-shot']);
  grunt.registerTask('default', ['build', 'connect']);
};
