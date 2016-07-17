WORKSPACE_CONTAINER=poccin_docker_1

if [ ! -f ${CONFIG_DIR}/workspaces.yml ]; then
    return
fi

if [ $(grep "CI_SERVER_URL" ${CONFIG_DIR}/workspaces.yml | wc -l) -eq 0 ]; then
    return
fi

if [ -d ${CONFIG_DIR}/volumes/gitlab-runner ]; then
    rm -fr ${CONFIG_DIR}/volumes/gitlab-runner
fi

mkdir ${CONFIG_DIR}/volumes/gitlab-runner

for i in $(grep "config/volumes/gitlab-runner" ${CONFIG_DIR}/workspaces.yml |cut -d: -f1 |sed -E 's/ +- +//g'); do
    mkdir $i
done

${BIN_DIR}/open-workspace
sleep 10
docker exec ${WORKSPACE_CONTAINER} gitlab-runner register --executor docker --non-interactive
sudo chmod -R +rw ${CONFIG_DIR}/volumes/gitlab-runner

WORKSPACE_ENV=`awk '{printf "\"%s\", ",$0}' ${CONFIG_DIR}/workspace.env | sed -E 's/, $//'`
sed -e "s|\"DUMMY\"|${WORKSPACE_ENV}|" -i ${CONFIG_DIR}/volumes/gitlab-runner/docker/config.toml
