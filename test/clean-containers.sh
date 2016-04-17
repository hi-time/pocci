#!/bin/bash
set -ex

assert()
{
    if [ `docker ps -a |grep $1 |wc -l` -gt 0 ]; then

        echo "ERROR: cannot clean"
        docker ps -a |grep $1
        exit 1
    fi
}

get_pocci_container() {
    docker ps $1 |grep "pocci[s|b|n|r|d]_"
}

BASE_DIR=$(cd $(dirname $0); pwd)
TEMP_DIR=${BASE_DIR}/temp

if [ `get_pocci_container |wc -l` -gt 0 ]; then
    `get_pocci_container |awk 'BEGIN{printf "docker stop "}{printf $1" "}'`
fi
if [ `get_pocci_container -a |wc -l` -gt 0 ]; then
    `get_pocci_container -a |awk 'BEGIN{printf "docker rm -v "}{printf $1" "}'`
fi

if [ -d ${TEMP_DIR} ]; then
    sudo rm -fr ${TEMP_DIR}
fi

assert poccis_
assert poccib_
assert poccin_
assert poccir_
assert poccid_
