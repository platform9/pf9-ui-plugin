/* Stub data while not fetching from real API */

const status = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  CONFIGURING: 'configuring',
  FAILED: 'failed',
}

const storageType = {
  S3: 'AWS-S3',
  ELASTIC_SEARCH: 'ElasticSearch',
}

const getLoggings = () => [
  {
    cluster: 'cluster-id-01',
    status: status.ENABLED,
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
    cluster: 'cluster-id-02',
    status: status.DISABLED,
    logStorage: [
      storageType.S3,
    ],
    logDestination: [
      'bucket123/regionnameABC',
    ],
  },
  {
    cluster: 'cluster-id-03',
    status: status.ENABLED,
    logStorage: [
      storageType.ELASTIC_SEARCH
    ],
    logDestination: [
      'http://mybucket.s3.johnsmith',
    ],
  },
  {
    cluster: 'cluster-id-04',
    status: status.ENABLED,
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
    cluster: 'cluster-id-05',
    status: status.CONFIGURING,
    logStorage: [
      storageType.ELASTIC_SEARCH
    ],
    logDestination: [
      'http://mybucket.s3.johnsmith',
    ],
  },
  {
    cluster: 'cluster-id-06',
    status: status.FAILED,
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
    cluster: 'cluster-id-07',
    status: status.DISABLED,
    logStorage: [
      storageType.S3,
    ],
    logDestination: [
      'bucket123/regionnameABC',
    ],
  },
  {
    cluster: 'cluster-id-08',
    status: status.ENABLED,
    logStorage: [
      storageType.ELASTIC_SEARCH
    ],
    logDestination: [
      'http://mybucket.s3.johnsmith',
    ],
  },
  {
    cluster: 'cluster-id-09',
    status: status.ENABLED,
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
    cluster: 'cluster-id-10',
    status: status.ENABLED,
    logStorage: [
      storageType.ELASTIC_SEARCH
    ],
    logDestination: [
      'http://mybucket.s3.johnsmith',
    ],
  },
]

const loggingsJSON = {
  'items': [
    {
      'kind': 'Output',
      'spec': {
        'type': 'elasticsearch',
        'params': [
          {
            'name': 'url',
            'value': 'http://elasticsearch.es-logging.svc.cluster.local:9200'
          },
          {
            'name': 'user',
            'value': 'test-elastic'
          },
          {
            'name': 'password',
            'value': 'test-password'
          },
          {
            'name': 'index_name',
            'value': 'test-index'
          }
        ]
      },
      'apiVersion': 'logging.pf9.io/v1alpha1',
      'metadata': {
        'name': 'es-object',
        'generation': 1,
        'resourceVersion': '3054',
        'creationTimestamp': '2019-10-08T20:07:28Z',
        'selfLink': '/apis/logging.pf9.io/v1alpha1/outputs/es-object',
        'uid': '2836f085-39cf-4b15-ae56-a653a46c8d44'
      }
    },
    {
      'kind': 'Output',
      'spec': {
        'type': 's3',
        'params': [
          {
            'valueFrom': {
              'namespace': 'default',
              'name': 's3',
              'key': 'access_key'
            },
            'name': 'aws_key_id'
          },
          {
            'valueFrom': {
              'namespace': 'default',
              'name': 's3',
              'key': 'secret_key'
            },
            'name': 'aws_sec_key'
          },
          {
            'name': 's3_region',
            'value': '<s3 region name>'
          },
          {
            'name': 's3_bucket',
            'value': '<s3 bucket name>'
          }
        ]
      },
      'apiVersion': 'logging.pf9.io/v1alpha1',
      'metadata': {
        'name': 'objstore',
        'generation': 1,
        'resourceVersion': '3127',
        'creationTimestamp': '2019-10-08T20:08:25Z',
        'selfLink': '/apis/logging.pf9.io/v1alpha1/outputs/objstore',
        'uid': 'ce89663d-faba-4f44-86cd-85600d07da0d'
      }
    }
  ],
  'kind': 'OutputList',
  'apiVersion': 'logging.pf9.io/v1alpha1',
  'metadata': {
    'continue': '',
    'selfLink': '/apis/logging.pf9.io/v1alpha1/outputs',
    'resourceVersion': '3132'
  }
}

const LoggingStub = {
  getLoggings,
  loggingsJSON,
}

export default LoggingStub
