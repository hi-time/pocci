
if [ -n "${GITLAB_TOP_PAGE}" ]; then
    sed -i ${TEMP_CONFIG_DIR}/services/core/gitlab/nginx.conf.template -e 's/#location/location/'
fi
