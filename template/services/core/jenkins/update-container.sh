echo "Update Jenkins container..."
JENKINS_CONTAINER=${POCCI_SERVICE_PREFIX}_jenkins_1

KEY_PAIR_DIR=${CONFIG_DIR}/.ssh
echo "Get key pair --> ${KEY_PAIR_DIR}"
${LIB_DIR}/docker-exec ${JENKINS_CONTAINER} bash -c 'if [ ! -d /var/jenkins_home/.ssh ]; then ssh-keygen -t rsa -N "" -f /var/jenkins_home/.ssh/id_rsa; fi'
if [ -d ${KEY_PAIR_DIR} ]; then
    rm -fr ${KEY_PAIR_DIR}
fi
docker cp ${JENKINS_CONTAINER}:/var/jenkins_home/.ssh ${KEY_PAIR_DIR}
