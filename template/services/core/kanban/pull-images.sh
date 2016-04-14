
KANBAN_VERSION=1.5.1
KANBAN_DIR=/tmp/kanban
KANBAN_REPOSITORY=${KANBAN_REPOSITORY:-"https://github.com/leanlabsio/kanban.git"}

git clone ${KANBAN_REPOSITORY} ${KANBAN_DIR}
cd ${KANBAN_DIR}
git checkout ${KANBAN_VERSION}

cp ${KANBAN_DIR}/docker-compose.yml ${CONFIG_DIR}/kanban-docker-compose.yml
${LIB_DIR}/pull-images kanban-docker-compose.yml
rm ${CONFIG_DIR}/kanban-docker-compose.yml
rm -fr ${KANBAN_DIR}
