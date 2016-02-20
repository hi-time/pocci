#!/bin/bash

openssl genrsa 2048 >server.pem
openssl req -key server.pem -batch -new -out ./public/server.csr -subj "${CERTIFICATE_SUBJECT}"
openssl req -in ./public/server.csr -text -noout
openssl ca -policy policy_anything -days 9999 -batch -in ./public/server.csr -cert ./public/cacerts/pocci-root-ca.crt -out ./public/server.crt
