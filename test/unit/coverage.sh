#!/bin/bash
set -e

BASE_DIR=$(cd $(dirname $0); pwd)
POCCI_DIR=$(cd ${BASE_DIR}/../..; pwd)

bashcov --root ${POCCI_DIR} ${BASE_DIR}/unit-test.sh
