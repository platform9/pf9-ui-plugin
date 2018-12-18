/* eslint-disable no-unused-vars */
import context from '../../../context'
import Service from '../../../models/qbert/Service'

export const getservices = (req, res) => {
  const services = Service.list(context)
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
  const service = { ...req.body }

  if (service.kind !== 'Service') {
    return res.status(400).send({code: 400, message: 'Must be of kind "Service"'})
  }
  if (Service.findByName(service.metadata.name)) {
    return res.status(409).send({code: 409, message: `services #{service.metadata.name} already exists`})
  }

  const newService = Service.create(service, context)
  res.status(201).send(newService)
}

// Returns the object in the response but immediately deletes it after
export const deleteService = (req, res) => {
  // TODO: account for tenancy
  const { serviceId, tenantId } = req.params
  console.log('Attempting to delete serviceId: ', serviceId)
  // this should throw an error if it doesn't exist
  Service.delete(serviceId, context)
  res.status(200).send({})
}
