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
    echo "gitlab: invalid build status: $1"
    exit 2
fi

sed -ie "3a export SONAR_ANALYSIS_MODE=preview" build.sh
if [ "$1" = "example-java" ]; then
    sed -ie "3a private String test1;" src/main/java/com/example/Greeting.java
else
    sed -ie "2a var test1;" app/index.js
fi

git commit -am "SonarQube preview mode"
git push origin master

timeout -sKILL 600 node /tmp/server.js

COMMIT_PATH=`curl -s http://gitlab.pocci.test/example/$1 | grep commit_short_id | sed -E 's|^.+href="(.+)".+|\1|'`
SONARQUBE_COMMENT=`curl -s http://gitlab.pocci.test${COMMIT_PATH} |grep unused | wc -l`

if [ "${SONARQUBE_COMMENT}" -ne 1 ]; then
    echo "SONARQUBE_COMMENT=${SONARQUBE_COMMENT}"
    exit 1
fi

exit 0
