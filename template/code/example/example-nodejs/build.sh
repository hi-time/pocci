#!/bin/bash
set -e

if [ -z "${CI_COMMIT_SHA}" ]; then
    export CI_COMMIT_SHA="${GIT_COMMIT}"
    export CI_COMMIT_REF_NAME="${GIT_BRANCH#*/}"
fi

npm install
bower install
npm test
