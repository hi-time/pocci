#!/bin/bash
set -ex

remove()
{
    for i in $(docker images |grep $1 |awk '{printf "%s:%s\n",$1,$2}'); do
        docker rmi $i
    done
}

remove xpfriend/workspace-nodejs
remove xpfriend/workspace-java
remove xpfriend/workspace-base
remove xpfriend/jenkins
remove xpfriend/sonarqube
remove xpfriend/fluentd
remove xpfriend/pocci-account-center
