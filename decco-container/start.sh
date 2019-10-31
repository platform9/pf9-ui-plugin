#!/bin/bash
set -e
confd -onetime -backend consul -node ${CONFIG_HOST_AND_PORT} -scheme ${CONFIG_SCHEME} -auth-token ${CONSUL_HTTP_TOKEN} -prefix /customers/${CUSTOMER_ID}/regions/${REGION_ID}
nginx -g "daemon off;"
