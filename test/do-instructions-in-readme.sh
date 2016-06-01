#!/bin/bash
set -ex

POCCI_REPO=$1

BASE_DIR=$(cd $(dirname $0); pwd)
TEMP_DIR=${BASE_DIR}/temp
LOG_FILE=${TEMP_DIR}/test.log

if [ -d ${TEMP_DIR} ]; then
    rm -fr ${TEMP_DIR}
fi

mkdir ${TEMP_DIR}

cd ${TEMP_DIR}
echo $(date): build >> ${LOG_FILE}
git clone ${POCCI_REPO} pocci
cd pocci
cd bin
bash ./build
