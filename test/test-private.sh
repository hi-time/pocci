#!/bin/bash
set -ex

BASE_DIR=$(cd $(dirname $0); pwd)

if [ -z "$1" ]; then
    ${BASE_DIR}/clean-containers.sh
fi
${BASE_DIR}/smoke-test.sh ${BASE_DIR}/../.git $1 $2
${BASE_DIR}/unit/coverage.sh
