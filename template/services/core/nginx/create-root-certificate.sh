#!/bin/bash

SUBJECT="/C=JP/ST=Chiba/O=Pocci/CN=Pocci Root CA for Development Environment/"

mkdir ./demoCA
mkdir ./demoCA/private
mkdir ./demoCA/newcerts
touch ./demoCA/index.txt
echo "01" > ./demoCA/serial

openssl genrsa 2048 > ./demoCA/private/cakey.pem
openssl req -key ./demoCA/private/cakey.pem -batch -new -out ./demoCA/cacert.csr -subj "${SUBJECT}"
openssl req -in ./demoCA/cacert.csr -text -noout
openssl x509 -days 9999 -req -signkey ./demoCA/private/cakey.pem < ./demoCA/cacert.csr > ./public/cacerts/pocci-root-ca.crt
