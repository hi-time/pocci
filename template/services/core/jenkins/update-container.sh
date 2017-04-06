echo "Update Jenkins container..."
JENKINS_CONTAINER=${POCCI_SERVICE_PREFIX}_jenkins_1

KEY_PAIR_DIR=${CONFIG_DIR}/.ssh
echo "Get key pair --> ${KEY_PAIR_DIR}"
${LIB_DIR}/docker-exec ${JENKINS_CONTAINER} bash -c 'if [ ! -d /var/jenkins_home/.ssh ]; then ssh-keygen -t rsa -N "" -f /var/jenkins_home/.ssh/id_rsa; fi'
if [ -d ${KEY_PAIR_DIR} ]; then
    rm -fr ${KEY_PAIR_DIR}
fi
docker cp ${JENKINS_CONTAINER}:/var/jenkins_home/.ssh ${KEY_PAIR_DIR}


if [ -n "${http_proxy_host}" ]; then

    cat << EOF > /tmp/proxy.xml 2>&1
<?xml version='1.0' encoding='UTF-8'?>
<proxy>
  <name>${http_proxy_host}</name>
  <port>${http_proxy_port}</port>
  <noProxyHost>${no_proxy}</noProxyHost>
  <userName>${http_proxy_user}</userName>
  <secretPassword>${http_proxy_pass}</secretPassword>
</proxy>
EOF

    docker cp /tmp/proxy.xml ${JENKINS_CONTAINER}:/var/jenkins_home
fi

docker cp ./install-plugins.sh ${JENKINS_CONTAINER}:/tmp
${LIB_DIR}/docker-exec ${JENKINS_CONTAINER} \
    bash /tmp/install-plugins.sh
