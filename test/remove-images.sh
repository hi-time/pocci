#!/bin/bash
set -ex

remove()
{
    for i in $(docker images |grep $1 |awk '{printf "%s:%s\n",$1,$2}'); do
        docker rmi $i
    done
}

remove xpfriend/jenkins-slave-iojs
remove xpfriend/jenkins-slave-nodejs
remove xpfriend/jenkins-slave-java
remove xpfriend/jenkins-slave-base
remove xpfriend/jenkins
remove xpfriend/sonarqube
