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
  const instances = PrometheusInstance.list({ context, clusterId })
  const body = {
    ...defaultBody,
    items: instances,
  }
  return res.send(body)
}

export const patchPrometheusInstance = (req, res) => {
  const { clusterId, name, namespace } = req.params
  const jsonPatches = req.body
  PrometheusInstance.update({ clusterId, name, namespace, data: jsonPatches })
  res.status(200).send({})
}

export const deletePrometheusInstance = (req, res) => {
  const { clusterId, name, namespace } = req.params
  PrometheusInstance.delete({ clusterId, name, namespace })
  res.status(200).send({})
}
