
KANBAN_VERSION=1.6.1
SERVICES_DIR=${TEMP_CONFIG_DIR}/services/core
KANBAN_DIR=${SERVICES_DIR}/kanban/volumes
KANBAN_COMPOSE_FILE=${SERVICES_DIR}/kanban/docker-compose.yml.template
KANBAN_REPOSITORY=${KANBAN_REPOSITORY:-"https://github.com/leanlabsio/kanban.git"}

git clone ${KANBAN_REPOSITORY} ${KANBAN_DIR}
cd ${KANBAN_DIR}
git checkout ${KANBAN_VERSION}
mv .git .git.backup
echo ".git.backup" >>./.gitignore

cd ${JS_DIR}
echo "cat << EOF" >${KANBAN_COMPOSE_FILE}
echo "#Kanban" >>${KANBAN_COMPOSE_FILE}
POCCIR_OPTS=" " \
    ../oneoff nodejs node \
    -e "require('pocci/kanban.js').edit('config/services/core/kanban/volumes/docker-compose.yml')" | \
    tr -d '\r' >>${KANBAN_COMPOSE_FILE}
echo "EOF" >>${KANBAN_COMPOSE_FILE}
