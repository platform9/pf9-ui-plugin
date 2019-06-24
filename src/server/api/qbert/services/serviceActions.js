import context from '../../../context'
import Service from '../../../models/qbert/Service'

export const getServices = (req, res) => {
  const { namespace, clusterId } = req.params
  const services = Service.list({ context, config: { clusterId, namespace } })
  const response = {
    apiVersion: 'v1',
    items: services,
    kind: 'serviceList',
    metadata: {
      resourceVersion: '5201088',
      selfLink: '/api/v1/services'
    }
  }
  return res.send(response)
}

export const postService = (req, res) => {
  const { namespace, clusterId } = req.params
  const service = { ...req.body }

  if (service.kind !== 'Service') {
    return res.status(400).send({ code: 400, message: 'Must be of kind "Service"' })
  }
  if (Service.findByName({ name: service.metadata.name, context, config: { clusterId, namespace } })) {
    return res.status(409).send({ code: 409, message: `services ${service.metadata.name} already exists` })
  }

  const newService = Service.create({ data: service, context, config: { clusterId, namespace } })
  res.status(201).send(newService)
}

export const deleteService = (req, res) => {
  const { serviceName, clusterId, namespace } = req.params
  console.log('Attempting to delete serviceName: ', serviceName)
  const service = Service.findByName({ name: serviceName, context, config: { clusterId, namespace } })
  // this should throw an error if it doesn't exist
  if (!service) {
    res.status(404).send({ code: 404, message: 'service not found' })
  }
  Service.delete({ id: service.metadata.uid, context })
  res.status(200).send(service)
}
