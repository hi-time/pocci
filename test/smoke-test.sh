#!/bin/bash
set -e

POCCI_REPO=$1

BASE_DIR=$(cd $(dirname $0); pwd)
LOG_FILE=${BASE_DIR}/temp/test.log

trap "date |tee -a ${LOG_FILE}" EXIT

step1() {
    ${BASE_DIR}/do-instructions-in-readme.sh ${POCCI_REPO}

    sleep 30
    echo $(date): BACKUP default >> ${LOG_FILE}
    sudo rm -fr ${BASE_DIR}/temp/pocci/backup/*
    ${BASE_DIR}/temp/pocci/bin/backup
    sudo mv ${BASE_DIR}/temp/pocci/backup ${BASE_DIR}/temp/pocci/backup_default
}

step2() {
    echo $(date): TEST_1 default >> ${LOG_FILE}
    cd ${BASE_DIR}/temp/pocci/bin/js
    ../oneoff nodejs grunt basic
    ../oneoff nodejs grunt prepare mochaTest:loginDefault
    ../oneoff nodejs grunt prepare mochaTest:defaultSetup
    ${BASE_DIR}/build-test.sh
}

step3() {
    echo $(date): SETUP jenkins >> ${LOG_FILE}
    echo 'y' | ${BASE_DIR}/temp/pocci/bin/create-config jenkins
    ${BASE_DIR}/temp/pocci/bin/up-service

    sleep 30
    echo $(date): BACKUP jenkins >> ${LOG_FILE}
    ${BASE_DIR}/temp/pocci/bin/backup
    sudo mv ${BASE_DIR}/temp/pocci/backup ${BASE_DIR}/temp/pocci/backup_jenkins
}

step4() {
    echo $(date): TEST_1 jenkins >> ${LOG_FILE}
    cd ${BASE_DIR}/temp/pocci/bin/js
    ../oneoff nodejs grunt basic
    ../oneoff nodejs grunt prepare mochaTest:loginJenkins
    ../oneoff nodejs grunt prepare mochaTest:jenkinsSetup
    ../oneoff nodejs grunt prepare mochaTest:gitlab
    ${BASE_DIR}/build-test.sh
}

step5() {
    echo $(date): SETUP redmine >> ${LOG_FILE}
    echo 'y' | ${BASE_DIR}/temp/pocci/bin/create-config redmine
    ${BASE_DIR}/temp/pocci/bin/up-service

    sleep 30
    echo $(date): BACKUP redmine >> ${LOG_FILE}
    ${BASE_DIR}/temp/pocci/bin/backup
    sudo mv ${BASE_DIR}/temp/pocci/backup ${BASE_DIR}/temp/pocci/backup_redmine
}

step6() {
    echo $(date): TEST_1 redmine >> ${LOG_FILE}
    cd ${BASE_DIR}/temp/pocci/bin/js
    ../oneoff nodejs grunt basic
    ../oneoff nodejs grunt prepare mochaTest:loginRedmine
    ../oneoff nodejs grunt prepare mochaTest:redmineSetup
    ${BASE_DIR}/build-test.sh
}

step7() {
    echo $(date): RESTORE default >> ${LOG_FILE}
    echo 'y' | ${BASE_DIR}/temp/pocci/bin/restore ${BASE_DIR}/temp/pocci/backup_default/*
}

step8() {
    echo $(date): TEST_2 default >> ${LOG_FILE}
    cd ${BASE_DIR}/temp/pocci/bin/js
    ../oneoff nodejs grunt basic
    ../oneoff nodejs grunt prepare mochaTest:loginDefault
    ../oneoff nodejs grunt prepare mochaTest:defaultSetup
    ${BASE_DIR}/build-test.sh
}

step9() {
    echo $(date): RESTORE redmine >> ${LOG_FILE}
    echo 'y' | ${BASE_DIR}/temp/pocci/bin/restore ${BASE_DIR}/temp/pocci/backup_redmine/*
}

step10() {
    echo $(date): TEST_2 redmine >> ${LOG_FILE}
    cd ${BASE_DIR}/temp/pocci/bin/js
    ../oneoff nodejs grunt basic
    ../oneoff nodejs grunt prepare mochaTest:loginRedmine
    ../oneoff nodejs grunt prepare mochaTest:redmineSetup
    ${BASE_DIR}/build-test.sh
}

step11() {
    echo $(date): RESTORE jenkins >> ${LOG_FILE}
    echo 'y' | ${BASE_DIR}/temp/pocci/bin/restore ${BASE_DIR}/temp/pocci/backup_jenkins/*
}

step12() {
    echo $(date): TEST_2 jenkins >> ${LOG_FILE}
    cd ${BASE_DIR}/temp/pocci/bin/js
    ../oneoff nodejs grunt basic
    ../oneoff nodejs grunt prepare mochaTest:loginJenkins
    ../oneoff nodejs grunt prepare mochaTest:jenkinsSetup
    ../oneoff nodejs grunt prepare mochaTest:gitlab
    ${BASE_DIR}/build-test.sh
}

step13() {
    echo "Done" | tee -a ${LOG_FILE}
}

START=1
if [ -n "$1" ]; then
    START=$2
fi

for i in `seq ${START} 13`; do
    if [ -f ${LOG_FILE} ]; then
        echo "step$i" | tee -a ${LOG_FILE}
    fi
  step$i
done

