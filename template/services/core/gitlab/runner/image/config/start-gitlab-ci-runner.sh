#!/bin/sh
set -e

if [ ! -f "${CONFIG_FILE}" ]; then
    gitlab-ci-multi-runner register --executor shell --non-interactive
fi

exec gitlab-ci-multi-runner "$@"
