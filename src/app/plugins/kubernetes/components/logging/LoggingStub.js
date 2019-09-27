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

const LoggingStub = {
  getLoggings,
}

export default LoggingStub
