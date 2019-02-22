import createModel from '../createModel'
import faker from 'faker'

const releaseDefaults = {}
const createFn = (_params = {}, context) => {
  const { iconUrl, ...params } = _params
  return {
    'id': faker.hacker.noun(),
    'type': 'release',
    ...params,
    attributes: {
      'chartIcon': faker.image.imageUrl(),
      'chartName': 'spark',
      'chartVersion': '0.2.1',
      'name': faker.company.companyName(),
      'namespace': 'default',
      'status': 'DEPLOYED',
      'updated': faker.date.past()
    }
  }
}

const options = {
  createFn,
  dataKey: 'releases',
  uniqueIdentifier: 'id',
  defaults: releaseDefaults,
}

const Release = createModel(options)

export default Release
