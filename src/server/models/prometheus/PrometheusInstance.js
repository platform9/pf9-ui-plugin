import faker from 'faker'
import uuid from 'uuid'
import { propEq } from 'ramda'

const create = (params) => {
  if (!params.clusterId) {
    console.error(`In create call for PrometheusInstance, clusterId is a required param.`)
  }
  const defaults = {
    cpu: '500m',
    name: faker.address.streetName(),
    namespace: 'default',
    memory: '512Mi',
    retention: '15d',
    uid: uuid.v4(),
  }
  const {
    clusterId, // required
    cpu,
    memory,
    name,
    namespace,
    retention,
    uid,
  } = { ...defaults, ...params }

  const service = `${name}-service-xyz`

  return {
    clusterId, // This should be stripped from actual responses
    apiVersion: 'monitoring.coreos.com/v1',
    kind: 'Prometheus',
    metadata: {
      annotations: {
        service,
        service_path: `/api/v1/namespaces/default/services/${service}:web/proxy`
      },
      creationTimestamp: '2019-06-21T21:26:02Z',
      generation: 1,
      name,
      namespace,
      resourceVersion: '2342',
      selfLink: `/apis/monitoring.coreos.com/v1/namespaces/${namespace}/prometheuses/${name}`,
      uid,
    },
    spec: {
      replicas: 1,
      resources: {
        requests: {
          cpu,
          memory,
        }
      },
      retention,
      ruleSelector: {
        matchLabels: {
          prometheus: name,
          role: 'alert-rules'
        }
      },
      rules: {
        alert: {}
      },
      serviceAccountName: 'default',
      serviceMonitorSelector: {
        matchLabels: {
          prometheus: name,
          role: 'service-monitor'
        }
      }
    }
  }
}

const PrometheusInstance = {
  list: ({ context, clusterId }) => {
    return context.prometheusInstances.filter(propEq('clusterId', clusterId))
  },
  create,
}

export default PrometheusInstance
