#!/bin/bash
set -e

add_trap() {
  git clone http://jenkinsci:password@gitlab.pocci.test/example-nexus/$1.git
  cd $1
  sed -ie "2a trap 'curl http://gitlab.pocci.test:9898/\$?' EXIT" build.sh
  git commit -am "[ci skip] [ci-skip] Update build.sh"
  git push origin master
  cd ..
}

build_lib() {
  git clone http://jenkinsci:password@gitlab.pocci.test/example-nexus/$1.git
  cd $1
  sed -ie "2a echo 'start'" build.sh
  git commit -am "Update build.sh"
  git push origin master

  timeout -sKILL 600 node /tmp/server.js
  cd ..
}

verify_job() {
  GITLAB_BUILD_STATUS=`curl "http://gitlab.pocci.test/example-nexus/$1/pipelines" | grep "ci-status ci-success" | wc -l`
  if [ "${GITLAB_BUILD_STATUS}" -eq 0 ]; then
      echo "gitlab: invalid build status: $1"
      exit 2
  fi
}

git config --global user.email "jenkins-ci@localhost.localdomain"
git config --global user.name "Jenkins"

cp ./server.js /tmp

if [ -d src.tmp ]; then
    rm -fr src.tmp
fi
mkdir src.tmp
cd src.tmp


add_trap java-app
build_lib java-lib
sleep 10
verify_job java-lib
verify_job java-app

add_trap nodejs-app
build_lib nodejs-lib
sleep 10
verify_job nodejs-lib
verify_job nodejs-app

exit 0
