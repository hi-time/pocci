#!/bin/bash
set -ex

POCCI_REPO=$1

BASE_DIR=$(cd $(dirname $0); pwd)
LOG_FILE=${BASE_DIR}/temp/test.log

trap "date |tee -a ${LOG_FILE}" EXIT
${BASE_DIR}/do-instructions-in-readme.sh ${POCCI_REPO}

cd ${BASE_DIR}/temp/pocci/bin/js

sleep 30
echo $(date): BACKUP default >> ${LOG_FILE}
sudo rm -fr ${BASE_DIR}/temp/pocci/backup/*
${BASE_DIR}/temp/pocci/bin/backup
sudo mv ${BASE_DIR}/temp/pocci/backup ${BASE_DIR}/temp/pocci/backup_default

echo $(date): TEST_1 default >> ${LOG_FILE}
../oneoff nodejs grunt basic
../oneoff nodejs grunt prepare mochaTest:loginDefault
../oneoff nodejs grunt prepare mochaTest:defaultSetup
${BASE_DIR}/build-test.sh

echo $(date): SETUP jenkins >> ${LOG_FILE}
echo 'y' | ${BASE_DIR}/temp/pocci/bin/create-config jenkins
${BASE_DIR}/temp/pocci/bin/up-service

sleep 30
echo $(date): BACKUP jenkins >> ${LOG_FILE}
${BASE_DIR}/temp/pocci/bin/backup
sudo mv ${BASE_DIR}/temp/pocci/backup ${BASE_DIR}/temp/pocci/backup_jenkins

echo $(date): TEST_1 jenkins >> ${LOG_FILE}
../oneoff nodejs grunt basic
../oneoff nodejs grunt prepare mochaTest:loginJenkins
../oneoff nodejs grunt prepare mochaTest:jenkinsSetup
../oneoff nodejs grunt prepare mochaTest:gitlab
${BASE_DIR}/build-test.sh

echo $(date): SETUP redmine >> ${LOG_FILE}
echo 'y' | ${BASE_DIR}/temp/pocci/bin/create-config redmine
${BASE_DIR}/temp/pocci/bin/up-service

sleep 30
echo $(date): BACKUP redmine >> ${LOG_FILE}
${BASE_DIR}/temp/pocci/bin/backup
sudo mv ${BASE_DIR}/temp/pocci/backup ${BASE_DIR}/temp/pocci/backup_redmine

echo $(date): TEST_1 redmine >> ${LOG_FILE}
../oneoff nodejs grunt basic
../oneoff nodejs grunt prepare mochaTest:loginRedmine
../oneoff nodejs grunt prepare mochaTest:redmineSetup
${BASE_DIR}/build-test.sh

echo $(date): RESTORE default >> ${LOG_FILE}
echo 'y' | ${BASE_DIR}/temp/pocci/bin/restore ${BASE_DIR}/temp/pocci/backup_default/*

echo $(date): TEST_2 default >> ${LOG_FILE}
../oneoff nodejs grunt basic
../oneoff nodejs grunt prepare mochaTest:loginDefault
../oneoff nodejs grunt prepare mochaTest:defaultSetup
${BASE_DIR}/build-test.sh


echo $(date): RESTORE redmine >> ${LOG_FILE}
echo 'y' | ${BASE_DIR}/temp/pocci/bin/restore ${BASE_DIR}/temp/pocci/backup_redmine/*

echo $(date): TEST_2 redmine >> ${LOG_FILE}
../oneoff nodejs grunt basic
../oneoff nodejs grunt prepare mochaTest:loginRedmine
../oneoff nodejs grunt prepare mochaTest:redmineSetup
${BASE_DIR}/build-test.sh


echo $(date): RESTORE jenkins >> ${LOG_FILE}
echo 'y' | ${BASE_DIR}/temp/pocci/bin/restore ${BASE_DIR}/temp/pocci/backup_jenkins/*

echo $(date): TEST_2 jenkins >> ${LOG_FILE}
../oneoff nodejs grunt basic
../oneoff nodejs grunt prepare mochaTest:loginJenkins
../oneoff nodejs grunt prepare mochaTest:jenkinsSetup
../oneoff nodejs grunt prepare mochaTest:gitlab
${BASE_DIR}/build-test.sh
