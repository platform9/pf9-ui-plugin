import createModel from '../createModel'
import uuid from 'uuid'

const options = {
  dataKey: 'cloudProviders',
  uniqueIdentifier: 'uuid',
  defaults: {
    name: '',
    type: '',
  },
  mappingFn: (input, context) => {
    return { nodePoolUuid: uuid.v4(), ...input }
  }
}

const CloudProvider = createModel(options)

CloudProvider.getCpTypes = () => {
  return [{type: 'aws'}, {type: 'gke'}, {type: 'local'}]
}

export default CloudProvider
