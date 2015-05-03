#!/bin/bash
set -ex

remove()
{
    if [ `docker images | grep $1 | wc -l` -gt 0 ]; then
      docker rmi $1
    fi
}

remove xpfriend/jenkins-slave-iojs
remove xpfriend/jenkins-slave-nodejs
remove xpfriend/jenkins-slave-java
remove xpfriend/jenkins-slave-base
remove xpfriend/jenkins
remove xpfriend/openldap
remove xpfriend/phpldapadmin
remove xpfriend/sonarqube
