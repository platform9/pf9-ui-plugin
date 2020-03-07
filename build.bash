#!/bin/bash
# This is the script that will be invoked from the CI server

set -eo pipefail

if [ -z "${WORKSPACE}" ]; then
    export WORKSPACE=$(cd $(dirname $0)/..; pwd)
fi

source ${WORKSPACE}/pf9-version/pf9-version.rc

cd ${WORKSPACE}/pf9-ui-plugin
echo "Copying config.example.js -> config.js"
cp config.example.js config.js
cd support
make rpm

