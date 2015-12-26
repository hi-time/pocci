if [ `docker ps |grep "${CI_CONTAINER}" |wc -l` -gt 0 ]; then
    echo "Update Jenkins plugins..."
    ${LIB_DIR}/docker-exec ${CI_CONTAINER} /config/update-plugins.sh

    KEY_PAIR_DIR=${CONFIG_DIR}/.ssh
    echo "Get key pair --> ${KEY_PAIR_DIR}"
    docker exec ${CI_CONTAINER} bash -c 'if [ ! -d /var/jenkins_home/.ssh ]; then ssh-keygen -t rsa -N "" -f /var/jenkins_home/.ssh/id_rsa; fi'
    if [ -d ${KEY_PAIR_DIR} ]; then
        rm -fr ${KEY_PAIR_DIR}
    fi
    docker cp ${CI_CONTAINER}:/var/jenkins_home/.ssh ${KEY_PAIR_DIR}
fi
