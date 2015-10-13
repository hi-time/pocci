#!/bin/sh

which java
if [ $? -ne 0 ]; then
    which apt-get
    if [ $? -eq 0 ]; then
        set -e
        su -c "set -e \
               && echo 'deb http://httpredir.debian.org/debian jessie-backports main' > /etc/apt/sources.list.d/jessie-backports.list \
               && apt-get update \
               && apt-get install -y openjdk-8-jre-headless \
               && rm -rf /var/lib/apt/lists/*"
        exit 0
    fi

    which yum
    if [ $? -eq 0 ]; then
        set -e
        su -c "set -e \
               && yum update -y \
               && yum install -y java-1.8.0-openjdk \
               && yum clean all"
        exit 0
    fi
    exit 1
fi

exit 0
