#!/bin/bash
set -e

if [ -z "${CI_BUILD_REF}" ]; then
    export CI_BUILD_REF="${GIT_COMMIT}"
    export CI_BUILD_REF_NAME="${GIT_BRANCH#*/}"
fi

npm install
bower install
npm test
