source ./nginx.conf.template > ${CONFIG_DIR}/nginx/nginx.conf

mkdir -p ${CONFIG_DIR}/nginx/ssl/public/cacerts
cp ./create-*-certificate.sh ${CONFIG_DIR}/nginx/ssl
cp ./index.html ${CONFIG_DIR}/nginx/ssl/public

cd ${CONFIG_DIR}/nginx/ssl
${BIN_DIR}/oneoff nodejs bash create-root-certificate.sh
${BIN_DIR}/oneoff nodejs bash create-server-certificate.sh

rm ${CONFIG_DIR}/nginx/ssl/create-*-certificate.sh
