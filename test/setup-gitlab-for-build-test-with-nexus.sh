#!/bin/bash
set -e

PRIVATE_TOKEN=`curl http://gitlab.pocci.test/api/v3/session -d 'login=jenkinsci&password=password' | jq --raw-output .private_token`

JAVA_APP_TOKEN=`curl -H "PRIVATE-TOKEN: ${PRIVATE_TOKEN}" -X POST "http://gitlab.pocci.test/api/v3/projects/2/triggers" | jq --raw-output .token`
NODEJS_APP_TOKEN=`curl -H "PRIVATE-TOKEN: ${PRIVATE_TOKEN}" -X POST "http://gitlab.pocci.test/api/v3/projects/4/triggers" | jq --raw-output .token`

curl -H "PRIVATE-TOKEN: ${PRIVATE_TOKEN}" -X POST "http://gitlab.pocci.test/api/v3/projects/1/variables" --form "key=MAVEN_DEPLOY_USERNAME" --form "value=admin"
curl -H "PRIVATE-TOKEN: ${PRIVATE_TOKEN}" -X POST "http://gitlab.pocci.test/api/v3/projects/1/variables" --form "key=MAVEN_DEPLOY_PASSWORD" --form "value=admin123"
curl -H "PRIVATE-TOKEN: ${PRIVATE_TOKEN}" -X POST "http://gitlab.pocci.test/api/v3/projects/1/variables" --form "key=BUILD_TRIGGER_OF_JAVA_APP" --form "value=http://gitlab.pocci.test/api/v3/projects/2/trigger/builds?token=${JAVA_APP_TOKEN}&ref=master"

curl -H "PRIVATE-TOKEN: ${PRIVATE_TOKEN}" -X POST "http://gitlab.pocci.test/api/v3/projects/3/variables" --form "key=NPM_USER" --form "value=admin"
curl -H "PRIVATE-TOKEN: ${PRIVATE_TOKEN}" -X POST "http://gitlab.pocci.test/api/v3/projects/3/variables" --form "key=NPM_PASS" --form "value=admin123"
curl -H "PRIVATE-TOKEN: ${PRIVATE_TOKEN}" -X POST "http://gitlab.pocci.test/api/v3/projects/3/variables" --form "key=NPM_EMAIL" --form "value=admin@example.org"
curl -H "PRIVATE-TOKEN: ${PRIVATE_TOKEN}" -X POST "http://gitlab.pocci.test/api/v3/projects/3/variables" --form "key=BUILD_TRIGGER_OF_NODEJS_APP" --form "value=http://gitlab.pocci.test/api/v3/projects/4/trigger/builds?token=${NODEJS_APP_TOKEN}&ref=master"
