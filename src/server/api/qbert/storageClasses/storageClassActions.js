import context from '../../../context'
import StorageClass from '../../../models/qbert/StorageClass'

export const getStorageClasses = (req, res) => {
  const { clusterId } = req.params
  const storageClasses = StorageClass.list({ context, config: { clusterId } })
  const response = {
    apiVersion: 'v1',
    items: storageClasses,
    kind: 'StorageClassList',
    metadata: {
      resourceVersion: '5201088',
      selfLink: '/api/v1/storageclasses'
    }
  }
  return res.send(response)
}

export const postStorageClass = (req, res) => {
  const { clusterId } = req.params
  const storageClass = { ...req.body }

  if (storageClass.kind !== 'StorageClass') {
    return res.status(400).send({code: 400, message: 'Must be of kind "StorageClass"'})
  }
  if (storageClass.findByName({ name: storageClass.metadata.name, context, config: { clusterId } })) {
    return res.status(409).send({code: 409, message: `storageClass ${storageClass.metadata.name} already exists`})
  }

  const newStorageClass = StorageClass.create({ data: storageClass, context, config: { clusterId } })
  res.status(201).send(newStorageClass)
}

export const deleteStorageClass = (req, res) => {
  const { storageClassName, clusterId } = req.params
  console.log('Attempting to delete storageClass: ', storageClassName)
  const storageClass = StorageClass.findByName({ name: storageClassName, context, config: { clusterId } })
  // this should throw an error if it doesn't exist
  if (!storageClass) {
    res.status(404).send({code: 404, message: 'storageClass not found'})
  }
  StorageClass.delete({ id: storageClass.metadata.uid, context })
  res.status(200).send(storageClass)
}
