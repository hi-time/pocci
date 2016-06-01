#!/bin/bash
set -e

cd /tmp
curl http://cert.pocci.test/cacerts/pocci-root-ca.crt -O
curl https://user.pocci.test/ --cacert pocci-root-ca.crt
