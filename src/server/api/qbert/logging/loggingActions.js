import context from '../../../context'
import Logging from '../../../models/qbert/Logging'

export const getLoggings = (req, res) => {
  const { clusterId } = req.params
  const loggings = Logging.list({ context, config: { clusterId } })
  return res.send(loggings)
}

export const postLogging = (req, res) => {
  const logging = { ...req.body }
  const newLogging = Logging.create({ data: logging, context })
  res.status(201).send(newLogging)
}

export const putLogging = (req, res) => {
  const { clusterId } = req.params
  const updatedLogging = Logging.update({ cluster: clusterId, data: req.body, context })
  res.status(200).send(updatedLogging)
}

export const deleteLogging = (req, res) => {
  const { clusterId } = req.params
  Logging.delete({ cluster: clusterId, context })
  res.status(200).send({})
}
