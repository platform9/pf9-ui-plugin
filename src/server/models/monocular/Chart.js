import { pick, times } from 'ramda'
import createModel from '../createModel'
import ChartVersion from './ChartVersion'
import faker from 'faker'

const getVersions = (chartName, context) => {
  return ChartVersion.list({ context })
}

// TODO:
//   We need to associate charts with a cluster as well.
//   Right now all clusters have the same list of charts.
const chartDefaults = {}
const createFn = (_params={}, context) => {
  const { iconUrl, ...params } = _params
  return {
    type: 'chart',
    id: `stable/${faker.hacker.noun()}`,
    links: { self: faker.internet.url() },
    ...params,
    attributes: {
      description: faker.company.catchPhrase(),
      home: faker.internet.url(),
      keywords: times(faker.hacker.noun, 4),
      maintainers: times(
        () => pick(['name', 'email'], faker.helpers.createCard()),
        2),
      name: faker.company.companyName(),
      sources: [ faker.internet.url() ],
      ...params.attributes,
      repo: {
        URL: faker.internet.url(),
        name: 'stable',
        source: faker.internet.url(),
        ...(params.attributes || {}).repo,
      },
    },
    relationships: {
      chart: {
        data: {
          home: faker.internet.url(),
          sources: [
            faker.internet.url(),
            faker.internet.url(),
            faker.internet.url()
          ],
          maintainers: [
            {
              email: faker.internet.email(),
              name: faker.name.firstName
            },{
              email: faker.internet.email(),
              name: faker.name.firstName
            }
          ]
        }
      },
      latestChartVersion: {
        data: {
          app_version: times(faker.random.number, 3).join('.'),
          created: '2018-12-17T22:55:38.21494671Z',
          digest: '92353f0bb7ec4ef735fad9acf593e7fb391d1fae619b762e1789d9517628533b',
          icons: [ { name: '160x160-fit', path: faker.image.imageUrl() } ],
          readme: '/assets/stable/project/0.1.2/README.md',
          urls: [ 'https://project-0.1.2.tar.gz' ],
          version: '0.1.2',
        }
      }
    }
  }
}

const options = {
  createFn,
  dataKey: 'charts',
  uniqueIdentifier: 'id',
  defaults: chartDefaults,
  customOperations: {
    getVersions
  },
}

const Chart = createModel(options)

export default Chart
