import createModel from '../createModel'
import faker from 'faker'

const repositoryDefaults = {}
const createFn = (_params = {}, context) => {
  const { iconUrl, ...params } = _params
  return {
    id: faker.hacker.noun(),
    type: 'repository',
    ...params,
    attributes: {
      URL: faker.internet.url(),
      name: faker.company.companyName(),
      source: 'https://github.com/kubernetes/charts/tree/master/incubator',
    },
  }
}

const options = {
  createFn,
  dataKey: 'repositories',
  uniqueIdentifier: 'id',
  defaults: repositoryDefaults,
}

const Repository = createModel(options)

export default Repository
