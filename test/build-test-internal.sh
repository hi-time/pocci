#!/bin/bash
set -e

cat << EOF >/tmp/server.js
require('http').createServer(function (req, res) {
  var url = require('url').parse(req.url);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('OK');
  process.exit(url.path.substring(1));
}).listen(9898);
EOF


git clone http://boze:password@gitlab.pocci.test/example/$1.git
cd $1
sed -ie "2a trap 'curl http://gitlab.pocci.test:9898/\$?' EXIT" build.sh
git config user.email "boze@localhost.localdomain"
git config user.name "BOZE, Taro"
git commit -am "Update build.sh"
git push origin master

timeout -sKILL 600 node /tmp/server.js

SONAR_PRJ_NM=`curl "http://sonar.pocci.test/api/projects/index?format=json&key=$2" |jq .[0].sc`

if [ "${SONAR_PRJ_NM}" = "null" ]; then
    echo "sonar: cannot find project: $1"
    exit 1
fi

sleep 10

GITLAB_BUILD_STATUS=`curl "http://gitlab.pocci.test/example/$1" | grep "ci-status ci-success" | wc -l`

if [ "${GITLAB_BUILD_STATUS}" -eq 0 ]; then
    GITLAB_BUILD_STATUS=`curl "http://gitlab.pocci.test/example/$1" | grep "ci-status ci-failed" | wc -l`
    if [ "${GITLAB_BUILD_STATUS}" -eq 0 ]; then
        echo "gitlab: invalid build status: $1"
        exit 2
    fi
    echo "(warning) gitlab: build: failed"
fi

exit 0
