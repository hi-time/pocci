#!/bin/sh

type git
if [ $? -ne 0 ]; then
    INSTALL_PACKAGE="git"
fi

type gitlab-ci-multi-runner
if [ $? -ne 0 ]; then
    INSTALL_PACKAGE="${INSTALL_PACKAGE} gitlab-ci-multi-runner"
fi

if [ -n "${INSTALL_PACKAGE}" ]; then
    type apt-get
    if [ $? -eq 0 ]; then
        echo "set -e \
               && . /config/proxy.env \
               && apt-get update && apt-get install -y curl \
               && curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-ci-multi-runner/script.deb.sh | bash \
               && apt-get install -y ${INSTALL_PACKAGE} \
               && rm -rf /var/lib/apt/lists/*" >./install-packages.sh
    fi

    type yum
    if [ $? -eq 0 ]; then
        echo "set -e \
               && . /config/proxy.env \
               && yum install -y curl \
               && curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-ci-multi-runner/script.rpm.sh | bash \
               && yum install --nogpgcheck -y ${INSTALL_PACKAGE} \
               && yum clean all"  >./install-packages.sh
    fi

    set -e
    if [ ! -f ./install-packages.sh ]; then
      echo "cannot find apt-get or yum"
      exit 1
    fi

    bash ./install-packages.sh
fi

exit 0
