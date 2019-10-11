/* Stub data while not fetching from real API */

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
    resourceVersion: '3132'
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
        value: 'test-elastic'
      },
      {
        name: 'password',
        value: 'test-password'
      },
      {
        name: 'index_name',
        value: 'test-index'
      }
    ]
  },
  apiVersion: 'logging.pf9.io/v1alpha1',
  metadata: {
    name: 'es-object',
    generation: 1,
    resourceVersion: '3054',
    creationTimestamp: '2019-10-08T20:07:28Z',
    selfLink: '/apis/logging.pf9.io/v1alpha1/outputs/es-object',
    uid: '2836f085-39cf-4b15-ae56-a653a46c8d44'
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
          key: 'access_key'
        },
        name: 'aws_key_id'
      },
      {
        valueFrom: {
          namespace: 'default',
          name: 's3',
          key: 'secret_key'
        },
        name: 'aws_sec_key'
      },
      {
        name: 's3_region',
        value: '<s3 region name>'
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
    resourceVersion: '3127',
    creationTimestamp: '2019-10-08T20:08:25Z',
    selfLink: '/apis/logging.pf9.io/v1alpha1/outputs/objstore',
    uid: 'ce89663d-faba-4f44-86cd-85600d07da0d'
  }
})

const createLoggingsJSON = (loggingsOfOneCluster) => {
  const items = []

  loggingsOfOneCluster.logStorage.forEach((storage, index) => {
    const destination = loggingsOfOneCluster.logDestination[index]

    if (storage === storageType.S3) {
      items.push(s3Item(destination))
    } else if (storage === storageType.ELASTIC_SEARCH) {
      items.push(elasticSearchItem(destination))
    }
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
