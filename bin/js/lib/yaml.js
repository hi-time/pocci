'use strict';
var fs = require('fs');
var yaml = require('js-yaml');

module.exports = {
  load: function(yamlFile) {
    var yamlText = fs.readFileSync(yamlFile, 'utf8');
    return yaml.safeLoad(yamlText);
  },
  save: function(obj, yamlFile) {
    var yamlText = yaml.safeDump(obj);
    fs.writeFileSync(yamlFile, yamlText);
  }
};
