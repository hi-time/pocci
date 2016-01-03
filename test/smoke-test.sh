#!/bin/bash
set -ex

POCCI_REPO=$1

BASE_DIR=$(cd $(dirname $0); pwd)

${BASE_DIR}/do-instructions-in-readme.sh ${POCCI_REPO}

cd ${BASE_DIR}/temp/pocci/bin/js

sleep 30

sudo rm -fr ${BASE_DIR}/temp/pocci/backup/*
${BASE_DIR}/temp/pocci/bin/backup
sudo mv ${BASE_DIR}/temp/pocci/backup ${BASE_DIR}/temp/pocci/backup_default

../oneoff nodejs grunt basic
../oneoff nodejs grunt prepare mochaTest:loginDefault
../oneoff nodejs grunt prepare mochaTest:defaultSetup
../oneoff nodejs grunt prepare mochaTest:gitlab

echo 'y' | ${BASE_DIR}/temp/pocci/bin/create-config gitlab
${BASE_DIR}/temp/pocci/bin/up-service

sleep 30
${BASE_DIR}/temp/pocci/bin/backup
sudo mv ${BASE_DIR}/temp/pocci/backup ${BASE_DIR}/temp/pocci/backup_gitlab

../oneoff nodejs grunt basic
../oneoff nodejs grunt prepare mochaTest:loginGitlab
../oneoff nodejs grunt prepare mochaTest:gitlabSetup

echo 'y' | ${BASE_DIR}/temp/pocci/bin/create-config redmine
${BASE_DIR}/temp/pocci/bin/up-service

sleep 30
${BASE_DIR}/temp/pocci/bin/backup
sudo mv ${BASE_DIR}/temp/pocci/backup ${BASE_DIR}/temp/pocci/backup_redmine

../oneoff nodejs grunt basic
../oneoff nodejs grunt prepare mochaTest:loginRedmine
../oneoff nodejs grunt prepare mochaTest:redmineSetup

echo 'y' | ${BASE_DIR}/temp/pocci/bin/restore ${BASE_DIR}/temp/pocci/backup_default/*

../oneoff nodejs grunt basic
../oneoff nodejs grunt prepare mochaTest:loginDefault
../oneoff nodejs grunt prepare mochaTest:defaultSetup
../oneoff nodejs grunt prepare mochaTest:gitlab


echo 'y' | ${BASE_DIR}/temp/pocci/bin/restore ${BASE_DIR}/temp/pocci/backup_redmine/*

../oneoff nodejs grunt basic
../oneoff nodejs grunt prepare mochaTest:loginRedmine
../oneoff nodejs grunt prepare mochaTest:redmineSetup


echo 'y' | ${BASE_DIR}/temp/pocci/bin/restore ${BASE_DIR}/temp/pocci/backup_gitlab/*

../oneoff nodejs grunt basic
../oneoff nodejs grunt prepare mochaTest:loginGitlab
../oneoff nodejs grunt prepare mochaTest:gitlabSetup
