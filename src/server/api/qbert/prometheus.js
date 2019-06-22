import context from '../../context'
import PrometheusInstance from '../../models/prometheus/PrometheusInstance'

const apiVersion = 'monitoring.coreos.com/v1'
const defaultBody = {
  apiVersion,
  kind: 'PrometheusList',
  items: [],
  metadata: {
    resourceVersion: '3496',
    selfLink: '/apis/monitoring.coreos.com/v1/prometheuses',
  },
}

export const getPrometheusInstances = (req, res) => {
  const { clusterId } = req.params
  const instances = PrometheusInstance.list({ context, config: { clusterId } })
  const body = {
    ...defaultBody,
    items: instances,
  }
  return res.send(body)
}
