import Repository from '../../../models/qbert/Repository'
import context from '../../../context'

export const getRepositoriesForCluster = (req, res) => {
  const repos = Repository.list({ context })
  return res.send({ data: repos })
}

export const createReponsitory = (req, res) => {
  // TODO
}

export const createRepositoryForCluster = (req, res) => {
  // TODO
}

export const deleteRepository = (req, res) => {
  // TODO
}

export const deleteRepositoryForCluster = (req, res) => {
  // TODO
}
