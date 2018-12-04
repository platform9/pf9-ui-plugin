import createModel from '../createModel'
import uuid from 'uuid'

const options = {
  dataKey: 'nodes',
  uniqueIdentifier: 'uuid',
  defaults: {
    api_responding: 0,
    type: 'local',
    clusterName: null,
    clusterUuid: null,
    isMaster: 0,
    name: '',
    nodePoolName: 'defaultPool',
    primaryIp: '0.0.0.0',
    projectId: '',
    status: 'ok',
  },
  mappingFn: (input, context) => {
    return { nodePoolUuid: uuid.v4(), ...input }
  }
}

const Node = createModel(options)

export default Node
