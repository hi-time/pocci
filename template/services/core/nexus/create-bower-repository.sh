#!/bin/bash
set -e

BASE_DIR=$(cd $(dirname $0); pwd)

CONTENT="repository.createBowerHosted('bower-internal'); repository.createBowerProxy('bower-io','http://bower.herokuapp.com'); repository.createBowerGroup('bower-all',['bower-io','bower-internal'])"
bash ${BASE_DIR}/call-api.sh proxy "${CONTENT}"
