#!/bin/bash

cd ${JENKINS_HOME}/war/WEB-INF
java -jar jenkins-cli.jar -s http://localhost:8080 install-plugin external-monitor-job gitlab-plugin ldap maven-plugin pam-auth role-strategy ssh-slaves windows-slaves -restart

PLUGINS_TXT_NEW=/tmp/${NAME}.new
for i in {1..60}; do
    curl -s --compressed http://localhost:8080/pluginManager/installed | \
        sed -E -e 's/data-plugin-id="[^"]+"/\n\0\n/g' | grep data-plugin-id | \
        sed -E -e 's/data-plugin-id=//g' -e 's/"//g' | grep -v jenkins-core | \
        sort | uniq > ${PLUGINS_TXT_NEW}
    if [ `cat ${PLUGINS_TXT_NEW} | wc -l` -gt 0 ]; then
        cat ${PLUGINS_TXT_NEW}
        exit 0
    fi
    echo -n "."
    sleep 2
done

exit 1
