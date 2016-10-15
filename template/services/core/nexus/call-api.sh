#!/bin/bash
set -e

cat << EOF > /tmp/$1.json
{
  "name": "$1",
  "type": "groovy",
  "content": "$2"
}
EOF

trap "curl -f -v -X DELETE -u admin:admin123 http://localhost:8081/service/siesta/rest/v1/script/$1" EXIT
curl -f -v -X POST -u admin:admin123 --header "Content-Type: application/json" http://localhost:8081/service/siesta/rest/v1/script/ -d @/tmp/$1.json
curl -f -v -X POST -u admin:admin123 --header "Content-Type: text/plain" http://localhost:8081/service/siesta/rest/v1/script/$1/run
