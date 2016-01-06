
LOG_CONFIG_FILE=${CONFIG_DIR}/fluent.conf

if [ -f ${LOG_CONFIG_FILE} ]; then
    rm ${LOG_CONFIG_FILE}
fi

for i in ${INTERNAL_SERVICES}; do
    if [ -f ${TEMPLATE_DIR}/services/core/$i/fluent.conf.template ]; then
        source ${TEMPLATE_DIR}/services/core/$i/fluent.conf.template >>${LOG_CONFIG_FILE}
    fi
done

cat ${TEMP_CONFIG_DIR}/fluent.conf >>${LOG_CONFIG_FILE}


if [ ! -d ${POCCI_LOG_DIR} ]; then
    mkdir ${POCCI_LOG_DIR}
fi
