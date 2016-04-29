#!/bin/bash
set -e

BASE_DIR=$(cd $(dirname $0); pwd)
POCCI_DIR=$(cd ${BASE_DIR}/../..; pwd)
export SUT_BIN=${POCCI_DIR}/bin
export SUT_TEMPLATE=${POCCI_DIR}/template

unit_test() {
    bats ${BASE_DIR}/$1.bats
    shellcheck ${POCCI_DIR}/$1
}

unit_test bin/lib/export-env
