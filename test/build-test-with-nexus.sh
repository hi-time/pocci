#!/bin/bash
set -e

cd $(dirname $0)

cp build-test-with-nexus-internal.sh temp
cp setup-gitlab-for-build-test-with-nexus.sh temp
cp js/*.js temp
cd temp

if [ "$1" = "gitlab" ]; then
  ./pocci/bin/oneoff nodejs bash ./setup-gitlab-for-build-test-with-nexus.sh
fi


POCCIR_OPTS_ADD='-p 9898:9898' ./pocci/bin/oneoff nodejs ./build-test-with-nexus-internal.sh
