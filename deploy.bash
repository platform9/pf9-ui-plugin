#!/bin/bash

set -eo pipefail

if [ -z "${TARGET_DUS}" ]; then
    echo "ERROR: Please set env var TARGET_DUS where UI app contents should be deployed. Example: 'ui-dev.platform9.horse,ui-stage.pf9.io'" >&2
    exit 1
fi

if [ -z "${WORKSPACE}" ]; then
    export WORKSPACE=$(cd $(dirname $0)/..; pwd)
fi

if [ ! -d ${WORKSPACE}/pf9-ui-plugin/build/ui ]; then
    echo "ERROR: ${WORKSPACE}/pf9-ui-plugin/build/ui does not exist." >&2
    exit 1
fi

pushd ${WORKSPACE}/pf9-ui-plugin/build
    echo "INFO: Creating a tarball from ${WORKSPACE}/pf9-ui-plugin/build/ui/*"
    tar cvzpf /tmp/ui.tgz ui/*
    OLD_IFS=${IFS}
    IFS=,
    for du in ${TARGET_DUS}; do
        echo "INFO: Starting to update DU ${du}"
        grep ${du} ~/.ssh/known_hosts > /dev/null || ssh-keyscan -t rsa ${du} >> ~/.ssh/known_hosts
        # TODO: Need a dedicated login to target DU that can modify files owned by root
        scp /tmp/ui.tgz centos@${du}:/tmp/ui.tgz
        ssh -t centos@${du} "cd /opt/pf9/www/public; sudo tar xvzpf /tmp/ui.tgz && \rm /tmp/ui.tgz"
        echo "INFO: Update completed for DU ${du}"
    done
    IFS=${OLD_IFS}
popd
