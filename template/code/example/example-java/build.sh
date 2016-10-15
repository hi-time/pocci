#!/bin/bash
set -e

if [ -z "${CI_BUILD_REF}" ]; then
    CI_BUILD_REF="${GIT_COMMIT}"
    CI_BUILD_REF_NAME="${GIT_BRANCH#*/}"
fi

BUILD_OPTS="-Dmaven.test.failure.ignore=true -Dsonar.analysis.mode=${SONAR_ANALYSIS_MODE:-publish} -Dsonar.gitlab.project_id=example/example-java -Dsonar.gitlab.commit_sha=${CI_BUILD_REF} -Dsonar.gitlab.ref_name=${CI_BUILD_REF_NAME}"
mvn -B ${BUILD_OPTS} clean org.jacoco:jacoco-maven-plugin:prepare-agent install sonar:sonar
