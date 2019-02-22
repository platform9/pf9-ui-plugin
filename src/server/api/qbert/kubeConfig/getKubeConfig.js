import context from '../../../context'
import Cluster from '../../../models/qbert/Cluster'
import faker from 'faker'
import yaml from 'js-yaml'

const randomKubeConfig = (cluster) => {
  const configObject = {
    apiVersion: 'v1',
    clusters: [
      {
        cluster: {
          'certificate-authority-data': faker.random.uuid(),
          server: `https://${faker.internet.ip()}`
        },
        name: cluster.name
      }
    ],
    contexts: [
      {
        context: {
          cluster: cluster.name,
          namespace: 'default',
          user: 'user@platform9.net'
        },
        name: 'default'
      }
    ],
    'current-context': 'default',
    kind: 'Config',
    preferences: {},
    users: [
      {
        name: 'user@platform9.net',
        user: {
          token: '__INSERT_BEARER_TOKEN_HERE__'
        }
      }
    ]
  }

  const configYaml = yaml.safeDump(configObject)
  return configYaml
}

const getKubeConfig = (req, res) => {
  const { clusterId } = req.params
  const cluster = Cluster.findById({ id: clusterId, context })

  if (!cluster) {
    return res.status(404).send({code: 404, message: 'cluster not found'})
  }

  const yamlString = randomKubeConfig(cluster)
  return res.status(200).send(yamlString)
}

export default getKubeConfig
