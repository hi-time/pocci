#!/bin/bash
set -e

BASE_DIR=$(cd $(dirname $0)/..; pwd)
source ${BASE_DIR}/bin/lib/init-env

docker pull xpfriend/dnsmasq:${VERSION_DNSMASQ}
docker pull xpfriend/sonarqube:${VERSION_SONARQUBE}
docker pull xpfriend/jenkins:${VERSION_JENKINS}
docker pull xpfriend/jenkins-slave-base:${VERSION_JENKINS_SLAVE_BASE}
docker pull xpfriend/jenkins-slave-nodejs:${VERSION_JENKINS_SLAVE_NODEJS}
docker pull xpfriend/jenkins-slave-iojs:${VERSION_JENKINS_SLAVE_IOJS}
docker pull xpfriend/jenkins-slave-java:${VERSION_JENKINS_SLAVE_JAVA}

docker pull nginx:${VERSION_NGINX}
docker pull sameersbn/postgresql:${VERSION_POSTGRESQL}
docker pull sameersbn/redis:${VERSION_REDIS}
docker pull sameersbn/gitlab:${VERSION_GITLAB}
docker pull sameersbn/postgresql:${VERSION_POSTGRESQL}
docker pull sameersbn/redmine:${VERSION_REDMINE}
docker pull sameersbn/postgresql:${VERSION_POSTGRESQL}
docker pull osixia/openldap:${VERSION_OPENLDAP}
docker pull osixia/phpldapadmin:${VERSION_PHPLDAPADMIN}
