import createModel from '../createModel'
import faker from 'faker'
import { getCurrentTime } from '../../util'
import ResMgrHost from '../resmgr/ResMgrHost'
import Node from './Node'
import Deployment from './Deployment'
import Namespace from './Namespace'
import Pod from './Pod'
import Service from './Service'
import StorageClass from './StorageClass'
import Logging from './Logging'
import { attachNodeToCluster } from './Operations'
import uuid from 'uuid'

const clusterDefaults = {
  allowWorkloadsOnMaster: 0,
  appCatalogEnabled: 1,
  authzEnabled: 1,
  canUpgrade: false,
  cloudProperties: {},
  cloudProviderName: 'someCloudProvider',
  cloudProviderType: 'local',
  containersCidr: '10.0.10.0/16',
  debug: 'false',
  dockerRoot: '/var/lib',
  enableMetallb: 0,
  etcdDataDir: '/var/opt/pf9/kube/etcd/data',
  externalDnsName: '',
  flannelIfaceLabel: '',
  flannelPublicIfaceLabel: '',
  isKubernetes: 1,
  isMesos: 0,
  isSwarm: 0,
  k8sApiPort: '443',
  keystoneEnabled: 1,
  lastOk: '',
  lastOp: '',
  masterIp: '10.0.10.20',
  masterVipIface: 'ens3',
  masterVipIpv4: '10.0.10.20',
  metallbCidr: '',
  name: '',
  networkPlugin: 'flannel',
  nodePoolName: 'defaultPool',
  numMasters: 0,
  numWorkers: 0,
  privileged: 1,
  projectId: '',
  runtimeConfig: '',
  servicesCidr: '10.10.10.0/16',
  status: 'ok',
  tags: {},
  taskError: null,
  taskStatus: 'success',
  nodes: [], // Custom field to track nodes
}

const options = {
  dataKey: 'clusters',
  uniqueIdentifier: 'uuid',
  defaults: clusterDefaults,
  mappingFn: (input, context) => {
    const defaultKeys = Object.keys(clusterDefaults)
    const cloudProperties = {}
    if (input.numMasters || input.numWorkers) {
      // Add nodes property if nodes are going to be created too
      input.nodes = []
    }
    if (input.numMasters) {
      // Create the master nodes and attach to cluster
      [...Array(input.numMasters)].map(() => {
        const name = `${input.name}-node-${faker.random.number()}`
        const resMgrHost = new ResMgrHost({ roles: ['pf9-containervisor'], info: { hostname: name } })
        const node = Node.create({ data: { name: name, api_responding: 1, isMaster: 1, uuid: resMgrHost.id }, context })
        attachNodeToCluster(node, input)
      })
    }
    if (input.numWorkers) {
      // Create the worker nodes and attach to cluster
      [...Array(input.numWorkers)].map(() => {
        const name = `${input.name}-node-${faker.random.number()}`
        const resMgrHost = new ResMgrHost({ roles: ['pf9-containervisor'], info: { hostname: name } })
        const node = Node.create({ data: { name: name, api_responding: 0, isMaster: 0, uuid: resMgrHost.id }, context })
        attachNodeToCluster(node, input)
      })
    }

    Object.keys(input).forEach(key => {
      // If property needs to go into cloudProperties
      if (!defaultKeys.includes(key)) {
        cloudProperties[key] = input[key]
        delete input[key]
      }
    })

    const currentTime = getCurrentTime()
    return { nodePoolUuid: uuid.v4(), cloudProperties: cloudProperties, cloudProviderUuid: uuid.v4(), created_at: currentTime, lastOk: currentTime, lastOp: currentTime, ...input }
  },
  loaderFn: (clusters) => {
    return clusters.map((cluster) => {
      const newCluster = { ...cluster }
      delete newCluster.nodes
      return newCluster
    })
  },
  onDeleteFn: (id, context, obj) => {
    // Need to clean up all resources on this cluster
    // Clean up attached nodes
    (obj.nodes || []).forEach((node) => {
      Node.delete({ id: node.uuid, context })
    })

    Deployment.deleteAllInCluster({ clusterId: id, context })
    Namespace.deleteAllInCluster({ clusterId: id, context })
    Pod.deleteAllInCluster({ clusterId: id, context })
    Service.deleteAllInCluster({ clusterId: id, context })
    StorageClass.deleteAllInCluster({ clusterId: id, context })
    Logging.deleteAllInCluster({ clusterId: id, context })
  }
}

const Cluster = createModel(options)

export default Cluster
