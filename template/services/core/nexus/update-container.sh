echo "Update Nexus container..."
NEXUS_CONTAINER=${POCCI_SERVICE_PREFIX}_nexus_1

exec_script() {
  docker cp ./$1 ${NEXUS_CONTAINER}:/tmp
  ${LIB_DIR}/docker-exec ${NEXUS_CONTAINER} bash /tmp/$1
}

docker cp ./call-api.sh ${NEXUS_CONTAINER}:/tmp

exec_script set-proxy.sh
exec_script create-npm-repository.sh
exec_script create-bower-repository.sh
