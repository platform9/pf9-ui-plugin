#!/bin/bash

set -eo pipefail

SSH_USER=${SSH_USER:-tcbuilder}

if [ "${TEAMCITY_BUILD_BRANCH}" != "<default>" ]; then
    echo "INFO: Skipping $(basename $0) for branch ${TEAMCITY_BUILD_BRANCH}"
    exit 0
fi

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
        # TODO: Need a dedicated login to target DU that can modify files owned by root
        scp -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no /tmp/ui.tgz ${SSH_USER}@${du}:/tmp/ui.tgz
        ssh -t -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no ${SSH_USER}@${du} "sudo chown -R ${SSH_USER} /opt/pf9/www/public; cd /opt/pf9/www/public; tar xvzpf /tmp/ui.tgz && \rm /tmp/ui.tgz"
        echo "INFO: Update completed for DU ${du}"
    done
    IFS=${OLD_IFS}
popd
