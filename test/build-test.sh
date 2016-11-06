#!/bin/bash
set -e

cd $(dirname $0)

cp build-test-internal.sh temp
cp js/*.js temp
cd temp
if [ -d example-nodejs ]; then
    rm -fr example-nodejs
fi
if [ -d example-java ]; then
    rm -fr example-java
fi

POCCIR_OPTS_ADD='-p 9898:9898' ./pocci/bin/oneoff nodejs ./build-test-internal.sh example-nodejs example-nodejs:1.0.0
POCCIR_OPTS_ADD='-p 9898:9898' ./pocci/bin/oneoff nodejs ./build-test-internal.sh example-java com.example:example-java
