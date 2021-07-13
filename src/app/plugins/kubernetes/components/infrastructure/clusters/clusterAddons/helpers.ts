import { coreDnsFieldId } from '../form-components/coreDns'
import { kubernetesDashboardFieldId } from '../form-components/kubernetes-dashboard'
import { metricsServerFieldId } from '../form-components/metrics-server'
import { objSwitchCase as objSwitchCaseAny } from 'utils/fp'

const objSwitchCase: any = objSwitchCaseAny

export enum ClusterAddonType {
  CoreDns = 'coredns',
  KubernetesDashboard = 'kubernetes-dashboard',
  MetricsServer = 'metrics-server',
  Metallb = 'metallb',
}

export const clusterAddonFieldId = {
  [ClusterAddonType.CoreDns]: coreDnsFieldId,
  [ClusterAddonType.KubernetesDashboard]: kubernetesDashboardFieldId,
  [ClusterAddonType.MetricsServer]: metricsServerFieldId,
  [ClusterAddonType.Metallb]: 'enableMetalb',
}

export const clusterAddonTypeName = {
  coreDns: ClusterAddonType.CoreDns,
  kubernetesDashboard: ClusterAddonType.KubernetesDashboard,
  metricsServer: ClusterAddonType.MetricsServer,
}

export const addonManagerAddons = [
  // ClusterAddonName.CoreDns,
  ClusterAddonType.MetricsServer,
  ClusterAddonType.KubernetesDashboard,
]

export const defaultDnsMemoryLimit = '170Mi'
export const defaultDnsDomain = 'cluster.local'
export const defaultAdditionalDnsConfig = ''

export const getCoreDnsRequestBody = (
  clusterId,
  dnsMemoryLimit = defaultDnsMemoryLimit,
  dnsDomain = defaultDnsDomain,
  additionalDnsConfig = defaultAdditionalDnsConfig,
) => ({
  apiVersion: 'sunpike.platform9.com/v1alpha2',
  kind: 'ClusterAddon',
  metadata: {
    labels: { 'sunpike.pf9.io/cluster': clusterId, type: 'coredns' },
    name: `${clusterId}-coredns`,
    namespace: 'default',
  },
  spec: {
    clusterID: clusterId,
    override: {
      params: [
        { name: 'dnsMemoryLimit', value: dnsMemoryLimit },
        { name: 'dnsDomain', value: dnsDomain },
        { name: 'base64EncAdditionalDnsConfig', value: additionalDnsConfig },
      ],
    },
    type: 'coredns',
    version: '1.7.0',
    watch: true,
  },
})

export const getMetallbRequestbody = (clusterId, metallbIpRange = '') => ({
  apiVersion: 'sunpike.platform9.com/v1alpha2',
  kind: 'ClusterAddon',
  metadata: {
    labels: { 'sunpike.pf9.io/cluster': clusterId, type: 'metallb' },
    name: `${clusterId}-metallb`,
    namespace: 'default',
  },
  spec: {
    clusterID: clusterId,
    override: {
      params: [{ name: 'MetallbIpRange', value: metallbIpRange }],
    },
    type: 'metallb',
    version: '0.9.5',
    watch: true,
  },
})

export const getMetricsServerRequestBody = (clusterId) => ({
  apiVersion: 'sunpike.platform9.com/v1alpha2',
  kind: 'ClusterAddon',
  metadata: {
    labels: { 'sunpike.pf9.io/cluster': clusterId, type: 'metrics-server' },
    name: `${clusterId}-metrics-server`,
    namespace: 'default',
  },
  spec: {
    clusterID: clusterId,
    override: {},
    type: 'metrics-server',
    version: '0.3.6',
    watch: true,
  },
})

export const getKubernetesDashboardRequestBody = (clusterId) => ({
  apiVersion: 'sunpike.platform9.com/v1alpha2',
  kind: 'ClusterAddon',
  metadata: {
    labels: { 'sunpike.pf9.io/cluster': clusterId, type: 'kubernetes-dashboard' },
    name: `${clusterId}-kubernetes-dashboard`,
    namespace: 'default',
  },
  spec: {
    clusterID: clusterId,
    override: {},
    type: 'kubernetes-dashboard',
    version: '2.0.3',
    watch: true,
  },
})

const awsAutoScaleDefaultCpuRequest = '100m'
const awsAutoScaleDefaultCpuLimit = '200m'
const awsAutoScaleDefaultMemRequest = '300Mi'
const awsAutoScaleDefaultMemLimit = '600Mi'

export const getAwsAutoScalerRequestBody = (clusterId, clusterRegion) => ({
  apiVersion: 'sunpike.platform9.com/v1alpha2',
  kind: 'ClusterAddon',
  metadata: {
    labels: { 'sunpike.pf9.io/cluster': clusterId, type: 'cluster-auto-scaler-aws' },
    name: `${clusterId}-cluster-auto-scaler-aws`,
    namespace: 'default',
  },
  spec: {
    clusterID: clusterId,
    override: {
      params: [
        { name: 'clusterUUID', value: '' },
        { name: 'clusterRegion', value: clusterRegion },
        { name: 'cpuRequest', value: awsAutoScaleDefaultCpuRequest },
        { name: 'cpuLimit', value: awsAutoScaleDefaultCpuLimit },
        { name: 'memRequest', value: awsAutoScaleDefaultMemRequest },
        { name: 'memLimit', value: awsAutoScaleDefaultMemLimit },
      ],
    },
    type: 'cluster-auto-scaler-aws',
    version: '1.14.7',
    watch: true,
  },
})

export const getAzureAutoScalerRequestBody = (clusterId, minNumWorkers, maxNumWorkers) => ({
  apiVersion: 'sunpike.platform9.com/v1alpha2',
  kind: 'ClusterAddon',
  metadata: {
    labels: { 'sunpike.pf9.io/cluster': clusterId, type: 'cluster-auto-scaler-azure' },
    name: `${clusterId}-cluster-auto-scaler-azure`,
    namespace: 'default',
  },
  spec: {
    clusterID: clusterId,
    override: {
      params: [
        { name: 'minNumWorkers', value: minNumWorkers },
        { name: 'maxNumWorkers', value: maxNumWorkers },
      ],
    },
    type: 'cluster-auto-scaler-azure',
    version: '1.13.8',
    watch: true,
  },
})

export const getClusterAddonBody = (clusterId, addonType, params) =>
  objSwitchCase(
    {
      [ClusterAddonType.KubernetesDashboard]: getKubernetesDashboardRequestBody(clusterId),
      [ClusterAddonType.MetricsServer]: getMetricsServerRequestBody(clusterId),
    },
    {},
  )(addonType)
