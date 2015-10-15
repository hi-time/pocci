#!/bin/sh

which git
if [ $? -ne 0 ]; then
    INSTALL_PACKAGE="git"
fi

which java
if [ $? -ne 0 ]; then
    INSTALL_PACKAGE="${INSTALL_PACKAGE} java"
fi

if [ -n "${INSTALL_PACKAGE}" ]; then
    which apt-get
    if [ $? -eq 0 ]; then
        set -e
        INSTALL_PACKAGE=`echo ${INSTALL_PACKAGE} | sed -e "s/java/openjdk-8-jre-headless/"`
        su -c "set -e \
               && . /config/proxy.env \
               && echo 'deb http://httpredir.debian.org/debian jessie-backports main' > /etc/apt/sources.list.d/jessie-backports.list \
               && apt-get update \
               && apt-get install -y ${INSTALL_PACKAGE} \
               && rm -rf /var/lib/apt/lists/*"
        exit 0
    fi

    which yum
    if [ $? -eq 0 ]; then
        set -e
        INSTALL_PACKAGE=`echo ${INSTALL_PACKAGE} | sed -e "s/java/java-1.8.0-openjdk/"`
        su -c "set -e \
               && . /config/proxy.env \
               && yum update -y \
               && yum install -y ${INSTALL_PACKAGE} \
               && yum clean all"
        exit 0
    fi
    exit 1
fi

exit 0
