import context from '../../../context'
import Repository from '../../../models/monocular/Repository'

export const getRepositories = (req, res) => {
  const charts = Repository.list({ context })
  return res.send({ data: charts })
}

export default getRepositories
