
echo "CI_CONTAINER=${POCCI_SERVICE_PREFIX}_jenkins_1" >>${CONFIG_DIR}/.env
echo "CI_URL=${JENKINS_URL}" >>${CONFIG_DIR}/.env

grep JENKINS_SLAVE ${LIB_DIR}/version |cut -d _ -f 4 |awk -F '=' 'BEGIN{printf "{"}NR!=1{printf ","}{printf "\"%s\":\"%s\"",tolower($1),$2}END{print "}"}' >${JS_DIR}/node_modules/pocci/jenkins-slaves-version.json
