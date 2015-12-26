
LOG_CONFIG_FILE=${CONFIG_DIR}/fluent.conf

for i in ${INTERNAL_SERVICES}; do
    if [ -f ${TEMPLATE_DIR}/services/core/$i/fluent.conf.template ]; then
        source ${TEMPLATE_DIR}/services/core/$i/fluent.conf.template >>${LOG_CONFIG_FILE}
    fi
done

if [ ! -d ${POCCI_LOG_DIR} ]; then
    mkdir ${POCCI_LOG_DIR}
fi
