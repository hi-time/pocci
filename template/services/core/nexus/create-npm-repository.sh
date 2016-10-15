#!/bin/bash
set -e

BASE_DIR=$(cd $(dirname $0); pwd)

CONTENT="repository.createNpmHosted('npm-internal'); repository.createNpmProxy('npmjs-org','https://registry.npmjs.org'); repository.createNpmGroup('npm-all',['npmjs-org','npm-internal'])"
bash ${BASE_DIR}/call-api.sh proxy "${CONTENT}"
