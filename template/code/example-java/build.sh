#!/bin/bash
set -eu

BUILD_OPTS="-Dmaven.test.failure.ignore=true"

mvn -B ${BUILD_OPTS} clean org.jacoco:jacoco-maven-plugin:0.7.4.201502262128:prepare-agent install sonar:sonar
