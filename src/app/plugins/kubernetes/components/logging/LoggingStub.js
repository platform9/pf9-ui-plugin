/* Stub data while not fetching from real API */
import faker from 'faker'
import uuid from 'uuid'

const storageType = {
  S3: 's3',
  ELASTIC_SEARCH: 'elasticsearch',
}

const allLoggings = [
  {
    logStorage: [
      storageType.S3,
      storageType.ELASTIC_SEARCH
    ],
    logDestination: [
      'bucket123/regionnameABC',
      'http://mybucket.s3.johnsmith',
    ],
  },
  {
    logStorage: [
      storageType.S3,
    ],
    logDestination: [
      'bucket123/regionnameABC',
    ],
  },
  {
    logStorage: [
      storageType.ELASTIC_SEARCH
    ],
    logDestination: [
      'http://mybucket.s3.johnsmith',
    ],
  },
  {
    logStorage: [
      storageType.S3,
      storageType.ELASTIC_SEARCH
    ],
    logDestination: [
      'bucket123/regionnameABC',
      'http://mybucket.s3.johnsmith',
    ],
  },
  {
    logStorage: [
      storageType.ELASTIC_SEARCH
    ],
    logDestination: [
      'http://mybucket.s3.johnsmith',
    ],
  },
]

const outputListData = {
  kind: 'OutputList',
  apiVersion: 'logging.pf9.io/v1alpha1',
  metadata: {
    continue: '',
    selfLink: '/apis/logging.pf9.io/v1alpha1/outputs',
    resourceVersion: `${faker.random.number()}`
  }
}

const elasticSearchItem = (url) => ({
  kind: 'Output',
  spec: {
    type: 'elasticsearch',
    params: [
      {
        name: 'url',
        value: url
      },
      {
        name: 'user',
        value: faker.internet.userName(),
      },
      {
        name: 'password',
        value: faker.internet.password(),
      },
      {
        name: 'index_name',
        value: `${faker.random.number()}`,
      }
    ]
  },
  apiVersion: 'logging.pf9.io/v1alpha1',
  metadata: {
    name: 'es-object',
    generation: 1,
    resourceVersion: `${faker.random.number()}`,
    creationTimestamp: faker.date.past(),
    selfLink: '/apis/logging.pf9.io/v1alpha1/outputs/es-object',
    uid: uuid.v4(),
  }
})

const s3Item = (bucket) => ({
  kind: 'Output',
  spec: {
    type: 's3',
    params: [
      {
        valueFrom: {
          namespace: 'default',
          name: 's3',
          key: faker.internet.password(),
        },
        name: 'aws_key_id'
      },
      {
        valueFrom: {
          namespace: 'default',
          name: 's3',
          key: faker.internet.password(),
        },
        name: 'aws_sec_key'
      },
      {
        name: 's3_region',
        value: faker.address.country(),
      },
      {
        name: 's3_bucket',
        value: bucket
      }
    ]
  },
  apiVersion: 'logging.pf9.io/v1alpha1',
  metadata: {
    name: 'objstore',
    generation: 1,
    resourceVersion: `${faker.random.number()}`,
    creationTimestamp: faker.date.past(),
    selfLink: '/apis/logging.pf9.io/v1alpha1/outputs/objstore',
    uid: uuid.v4(),
  }
})

const mapStorage = {
  [storageType.S3]: s3Item,
  [storageType.ELASTIC_SEARCH]: elasticSearchItem,
}

const createLoggingsJSON = (loggingsOfOneCluster) => {
  const items = []

  loggingsOfOneCluster.logStorage.forEach((storage, index) => {
    const destination = loggingsOfOneCluster.logDestination[index]
    const item = mapStorage[storage](destination)
    items.push(item)
  })

  return {
    items,
    ...outputListData,
  }
}

const loggingsForAllClusters = allLoggings.map(loggingsForOneCluster => createLoggingsJSON(loggingsForOneCluster))

const LoggingStub = {
  loggingsForAllClusters,
}

export default LoggingStub
