#!/bin/bash
set -e

BASE_DIR=$(cd $(dirname $0)/..; pwd)
source ${BASE_DIR}/bin/init-env

docker pull xpfriend/sonarqube:${VERSION_SONARQUBE}
docker pull xpfriend/jenkins:${VERSION_JENKINS}
docker pull xpfriend/jenkins-slave-base:${VERSION_JENKINS_SLAVE_BASE}
docker pull xpfriend/jenkins-slave-nodejs:${VERSION_JENKINS_SLAVE_NODEJS}
docker pull xpfriend/jenkins-slave-iojs:${VERSION_JENKINS_SLAVE_IOJS}
docker pull xpfriend/jenkins-slave-java:${VERSION_JENKINS_SLAVE_JAVA}
