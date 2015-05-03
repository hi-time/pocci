#!/bin/bash
set -ex

POCCI_REPO=$1

BASE_DIR=$(cd $(dirname $0); pwd)

${BASE_DIR}/do-instructions-in-readme.sh ${POCCI_REPO}

cd ${BASE_DIR}/temp/pocci/bin/js

PORTAL_TEST=gitlab

sudo rm -fr ${BASE_DIR}/temp/pocci/backup/*
${BASE_DIR}/temp/pocci/bin/backup
../oneoff iojs grunt smokeTest ${PORTAL_TEST}
echo 'y' | ${BASE_DIR}/temp/pocci/bin/restore ${BASE_DIR}/temp/pocci/backup/*
../oneoff iojs grunt smokeTest ${PORTAL_TEST}
