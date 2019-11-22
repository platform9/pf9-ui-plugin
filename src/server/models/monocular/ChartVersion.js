import createModel from '../createModel'
import faker from 'faker'

const chartVersionDefaults = {}
const createFn = (_params = {}, context) => {
  const { iconUrl, ...params } = _params
  return {
    id: `stable/${faker.hacker.noun()}`,
    type: 'chartVersion',
    ...params,
    attributes: {
      created: faker.date.past(),
      app_version: `v${faker.system.semver()}`,
      icons: [
        {
          name: faker.hacker.noun(),
          path: faker.image.imageUrl(),
        },
      ],
      readme: '/assets/stable/aerospike/0.2.9/README.md',
      urls: [
        faker.internet.url(),
      ],
      version: faker.system.semver(),
    },
  }
}

const options = {
  createFn,
  dataKey: 'chartVersions',
  uniqueIdentifier: 'id',
  defaults: chartVersionDefaults,
}

const ChartVersion = createModel(options)

export default ChartVersion
