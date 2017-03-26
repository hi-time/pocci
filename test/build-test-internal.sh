#!/bin/bash
set -e

cp ./server.js /tmp

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

GITLAB_BUILD_STATUS=`curl "http://gitlab.pocci.test/example/$1/pipelines.json" | jq .pipelines[0].details.status.group  | sed 's/"//g'`
echo "${GITLAB_BUILD_STATUS}"
if [ "${GITLAB_BUILD_STATUS}" != "success" ]; then
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

sleep 10

COMMIT_ID=`curl "http://gitlab.pocci.test/example/$1/pipelines.json" | jq .pipelines[0].commit.id | sed 's/"//g'`
SONARQUBE_COMMENT=`curl -s http://gitlab.pocci.test/example/$1/commit/${COMMIT_ID} |grep unused | wc -l`

if [ "${SONARQUBE_COMMENT}" -ne 1 ]; then
    echo "COMMIT_ID=${COMMIT_ID}"
    echo "SONARQUBE_COMMENT=${SONARQUBE_COMMENT}"
    exit 1
fi

exit 0
