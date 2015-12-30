
if [ $(grep "CI_SERVER_URL" ${CONFIG_DIR}/workspaces.yml | wc -l) -eq 0 ]; then
    exit
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
sudo chmod -R +r ${CONFIG_DIR}/volumes/gitlab-runner
