#!/bin/bash
set -e

POCCI_REPO=$1

BASE_DIR=$(cd $(dirname $0); pwd)
LOG_FILE=${BASE_DIR}/temp/test.log

trap "date |tee -a ${LOG_FILE}" EXIT

move_backup_dir() {
    if [ -d ${BASE_DIR}/temp/pocci/backup_$1 ]; then
        sudo rm -fr ${BASE_DIR}/temp/pocci/backup_$1
    fi
    sudo mv ${BASE_DIR}/temp/pocci/backup ${BASE_DIR}/temp/pocci/backup_$1
}

stage0() {
    ${BASE_DIR}/do-instructions-in-readme.sh ${POCCI_REPO}
}

stage1() {
    echo $(date): SETUP default >> ${LOG_FILE}
    echo 'y' | ${BASE_DIR}/temp/pocci/bin/create-service

    sleep 60
    echo $(date): BACKUP default >> ${LOG_FILE}
    sudo rm -fr ${BASE_DIR}/temp/pocci/backup/*
    ${BASE_DIR}/temp/pocci/bin/backup
    move_backup_dir default

    echo $(date): TEST_1 default >> ${LOG_FILE}
    cd ${BASE_DIR}/temp/pocci/bin/js
    ../oneoff nodejs grunt basic
    ../oneoff nodejs grunt prepare mochaTest:loginDefault
    ../oneoff nodejs grunt prepare mochaTest:defaultSetup
    ../oneoff nodejs grunt prepare mochaTest:gitlab
    ${BASE_DIR}/build-test.sh
}

stage2() {
    echo $(date): SETUP taiga >> ${LOG_FILE}
    echo 'y' | ${BASE_DIR}/temp/pocci/bin/create-config taiga
    ${BASE_DIR}/temp/pocci/bin/up-service

    sleep 60
    echo $(date): BACKUP taiga >> ${LOG_FILE}
    ${BASE_DIR}/temp/pocci/bin/backup
    move_backup_dir taiga

    echo $(date): TEST_1 taiga >> ${LOG_FILE}
    cd ${BASE_DIR}/temp/pocci/bin/js
    ../oneoff nodejs grunt basic
    ../oneoff nodejs grunt prepare mochaTest:loginTaiga
    ../oneoff nodejs grunt prepare mochaTest:taigaSetup
    ${BASE_DIR}/build-test.sh
}

stage3() {
    echo $(date): SETUP redmine >> ${LOG_FILE}
    echo 'y' | ${BASE_DIR}/temp/pocci/bin/create-config redmine
    ${BASE_DIR}/temp/pocci/bin/up-service

    sleep 60
    echo $(date): BACKUP redmine >> ${LOG_FILE}
    ${BASE_DIR}/temp/pocci/bin/backup
    move_backup_dir redmine

    echo $(date): TEST_1 redmine >> ${LOG_FILE}
    cd ${BASE_DIR}/temp/pocci/bin/js
    ../oneoff nodejs grunt basic
    ../oneoff nodejs grunt prepare mochaTest:loginRedmine
    ../oneoff nodejs grunt prepare mochaTest:redmineSetup
    ${BASE_DIR}/build-test.sh
}

stage4() {
    echo $(date): RESTORE default >> ${LOG_FILE}
    echo 'y' | ${BASE_DIR}/temp/pocci/bin/restore ${BASE_DIR}/temp/pocci/backup_default/*

    echo $(date): TEST_2 default >> ${LOG_FILE}
    cd ${BASE_DIR}/temp/pocci/bin/js
    ../oneoff nodejs grunt basic
    ../oneoff nodejs grunt prepare mochaTest:loginDefault
    ../oneoff nodejs grunt prepare mochaTest:defaultSetup
    ../oneoff nodejs grunt prepare mochaTest:gitlab
    ${BASE_DIR}/build-test.sh
}

stage5() {
    echo $(date): RESTORE redmine >> ${LOG_FILE}
    echo 'y' | ${BASE_DIR}/temp/pocci/bin/restore ${BASE_DIR}/temp/pocci/backup_redmine/*

    echo $(date): TEST_2 redmine >> ${LOG_FILE}
    cd ${BASE_DIR}/temp/pocci/bin/js
    ../oneoff nodejs grunt basic
    ../oneoff nodejs grunt prepare mochaTest:loginRedmine
    ../oneoff nodejs grunt prepare mochaTest:redmineSetup
    ${BASE_DIR}/build-test.sh
}

stage6() {
    echo $(date): RESTORE taiga >> ${LOG_FILE}
    echo 'y' | ${BASE_DIR}/temp/pocci/bin/restore ${BASE_DIR}/temp/pocci/backup_taiga/*

    echo $(date): TEST_2 taiga >> ${LOG_FILE}
    cd ${BASE_DIR}/temp/pocci/bin/js
    ../oneoff nodejs grunt basic
    ../oneoff nodejs grunt prepare mochaTest:loginTaiga
    ../oneoff nodejs grunt prepare mochaTest:taigaSetup
    ${BASE_DIR}/build-test.sh
}

stage7() {
    echo $(date): SETUP https >> ${LOG_FILE}
    echo 'y' | ${BASE_DIR}/temp/pocci/bin/create-config ${BASE_DIR}/test-https/setup.https.yml
    ${BASE_DIR}/temp/pocci/bin/up-service

    echo $(date): TEST_1 https >> ${LOG_FILE}
    cd ${BASE_DIR}/temp/pocci/bin/js
    ../oneoff nodejs grunt basic
    ../oneoff nodejs grunt prepare mochaTest:httpsSetup

    echo $(date): TEST_2 https >> ${LOG_FILE}
    cd ${BASE_DIR}/test-https
    ${BASE_DIR}/temp/pocci/bin/oneoff nodejs bash /app/test-https.sh
}

stage8() {
    echo "$(date): SETUP setup.nexus.yml" >> ${LOG_FILE}
    echo 'y' | POCCI_TEMPLATE="template https://github.com/xpfriend/pocci-template-examples.git" \
                ${BASE_DIR}/temp/pocci/bin/create-service setup-files/extra/setup.nexus.yml

    echo "$(date): TEST setup.nexus.yml" >> ${LOG_FILE}
    ${BASE_DIR}/build-test-with-nexus.sh gitlab
}

stage9() {
    echo "$(date): SETUP setup.nexus.yml +jenkins" >> ${LOG_FILE}
    echo 'y' | POCCI_TEMPLATE="template https://github.com/xpfriend/pocci-template-examples.git" \
                ${BASE_DIR}/temp/pocci/bin/create-config setup-files/extra/setup.nexus.yml +jenkins
    cat ${BASE_DIR}/temp/pocci/config/.env ${BASE_DIR}/nexus-env.txt > /tmp/.env
    cat ${BASE_DIR}/temp/pocci/config/workspace.env ${BASE_DIR}/nexus-env.txt > /tmp/workspace.env
    cp /tmp/.env ${BASE_DIR}/temp/pocci/config/
    cp /tmp/workspace.env ${BASE_DIR}/temp/pocci/config/
    ${BASE_DIR}/temp/pocci/bin/up-service

    echo "$(date): TEST setup.nexus.yml +jenkins" >> ${LOG_FILE}
    ${BASE_DIR}/build-test-with-nexus.sh
}

stage10() {
    echo "$(date): SETUP redmine +nexus +proxy -redmine" >> ${LOG_FILE}
    echo 'y' | POCCI_TEMPLATE="template https://github.com/xpfriend/pocci-template-examples.git" \
                ${BASE_DIR}/temp/pocci/bin/create-service redmine +nexus +proxy -redmine

    echo "$(date): TEST redmine +nexus +proxy -redmine" >> ${LOG_FILE}
    cd ${BASE_DIR}/temp/pocci/bin/js
    ../oneoff nodejs grunt basic
    ../oneoff nodejs grunt prepare mochaTest:loginNexus
    ../oneoff nodejs grunt prepare mochaTest:nexusSetup
    ${BASE_DIR}/build-test.sh
}

START=0
END=10

if [ -n "$2" ]; then
    START=$2
fi
if [ -n "$3" ]; then
    END=$3
fi

for i in `seq ${START} ${END}`; do
    if [ -f ${LOG_FILE} ]; then
        echo "" | tee -a ${LOG_FILE}
        echo "# stage$i" | tee -a ${LOG_FILE}
    fi
    stage$i
done

echo "Done" | tee -a ${LOG_FILE}
