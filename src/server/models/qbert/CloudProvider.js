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

export default CloudProvider
