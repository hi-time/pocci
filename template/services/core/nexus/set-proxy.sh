#!/bin/bash
set -e

BASE_DIR=$(cd $(dirname $0); pwd)

if [ -z "${http_proxy_host}" ]; then
  exit 0
fi

if [ -n "${http_proxy_user}" ]; then
  CONTENT="core.httpProxyWithBasicAuth('"${http_proxy_host}"', ${http_proxy_port}, '"${http_proxy_user}"', '"${http_proxy_pass}"');"
else
  CONTENT="core.httpProxy('"${http_proxy_host}"', ${http_proxy_port});"
fi

if [ -n "${no_proxy}" ]; then
  CONTENT=${CONTENT}"core.nonProxyHosts('"`echo ${no_proxy} | sed -e "s/,/','/g"`"');"
fi

bash ${BASE_DIR}/call-api.sh proxy "${CONTENT}"
