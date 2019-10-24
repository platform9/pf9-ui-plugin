import createModel from '../createModel'

const options = {
  dataKey: 'apiAccess',
  uniqueIdentifier: 'uuid',
  defaults: {
    metaData: {
      annotations: {
        'apiAccess.kubernetes.io/is-default-class': 'false'
      },
      service: '',
      type: '',
      url: '',
      uuid: '',
    },
    provisioner: 'kubernetes.io/aws-ebs',
    metadata: {
      resourceVersion: '5201088',
      selfLink: '/api/v1/storageclasses'
    }
  },
  loaderFn: (input, context) => {
    return { ...input }
  }
}

const ApiAccess = createModel(options)

export default ApiAccess;
