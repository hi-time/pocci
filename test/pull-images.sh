#!/bin/bash
set -e

docker pull xpfriend/openldap
docker pull xpfriend/phpldapadmin
docker pull xpfriend/sonarqube
docker pull xpfriend/jenkins
docker pull xpfriend/jenkins-slave-base
docker pull xpfriend/jenkins-slave-nodejs
docker pull xpfriend/jenkins-slave-iojs
docker pull xpfriend/jenkins-slave-java
