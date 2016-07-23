#!/bin/sh

type git
if [ $? -ne 0 ]; then
    INSTALL_PACKAGE="git"
fi

type java
if [ $? -ne 0 ]; then
    INSTALL_PACKAGE="${INSTALL_PACKAGE} java"
fi

if [ -n "${INSTALL_PACKAGE}" ]; then
    type apk
    if [ $? -eq 0 ]; then
        INSTALL_PACKAGE=`echo ${INSTALL_PACKAGE} | sed -e "s/java/openjdk8/"`
        echo "set -e \
               && . /config/proxy.env \
               && apk add --no-cache ${INSTALL_PACKAGE}" >./install-packages.sh
    fi

    type apt-get
    if [ $? -eq 0 ]; then
        INSTALL_PACKAGE=`echo ${INSTALL_PACKAGE} | sed -e "s/java/openjdk-8-jre-headless/"`
        echo "set -e \
               && . /config/proxy.env \
               && echo 'deb http://httpredir.debian.org/debian jessie-backports main' > /etc/apt/sources.list.d/jessie-backports.list \
               && apt-get update \
               && apt-get install -y ${INSTALL_PACKAGE} \
               && rm -rf /var/lib/apt/lists/*" >./install-packages.sh
    fi

    type yum
    if [ $? -eq 0 ]; then
        INSTALL_PACKAGE=`echo ${INSTALL_PACKAGE} | sed -e "s/java/java-1.8.0-openjdk/"`
        echo "set -e \
               && . /config/proxy.env \
               && yum update -y \
               && yum install -y ${INSTALL_PACKAGE} \
               && yum clean all" >./install-packages.sh
    fi

    set -e
    if [ ! -f ./install-packages.sh ]; then
      echo "cannot find apk, apt-get or yum"
      exit 1
    fi

    sh ./install-packages.sh
fi

exit 0
