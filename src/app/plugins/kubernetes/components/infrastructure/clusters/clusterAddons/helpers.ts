import { coreDnsFieldId } from '../form-components/coreDns'
import { kubernetesDashboardFieldId } from '../form-components/kubernetes-dashboard'
import { metricsServerFieldId } from '../form-components/metrics-server'
import { objSwitchCase as objSwitchCaseAny } from 'utils/fp'
import { metalLbFieldId } from '../form-components/metal-lb'
import { azureAutoscalingFieldId } from '../form-components/auto-scaling'
import { getMetalLbCidr } from '../helpers'
import { awsAutoScalingFieldId } from '../aws/AwsAutoScaling'

const objSwitchCase: any = objSwitchCaseAny

export enum ClusterAddonType {
  CoreDns = 'coredns',
  KubernetesDashboard = 'kubernetes-dashboard',
  MetricsServer = 'metrics-server',
  MetalLb = 'metallb',
  AzureAutoScaler = 'cluster-auto-scaler-azure',
  AwsAutoScaler = 'cluster-auto-scaler-aws'
}

export const clusterAddonFieldId = {
  [ClusterAddonType.CoreDns]: coreDnsFieldId,
  [ClusterAddonType.KubernetesDashboard]: kubernetesDashboardFieldId,
  [ClusterAddonType.MetricsServer]: metricsServerFieldId,
  [ClusterAddonType.MetalLb]: metalLbFieldId,
  [ClusterAddonType.AzureAutoScaler]: azureAutoscalingFieldId,
  [ClusterAddonType.AwsAutoScaler]: awsAutoScalingFieldId,
}

export const addonManagerAddons = [
  ClusterAddonType.MetricsServer,
  ClusterAddonType.KubernetesDashboard,
  ClusterAddonType.CoreDns,
  ClusterAddonType.MetalLb,
  ClusterAddonType.AzureAutoScaler,
  ClusterAddonType.AwsAutoScaler,
]

// Maps Addon Manager API addon param names to UI field names
export const addonParamsApiNameMap = {
    // CoreDns
    dnsMemoryLimit: 'dnsMemoryLimit',
    dnsDomain: 'dnsDomain',
    base64EncAdditionalDnsConfig: 'base64EncAdditionalDnsConfig',
    // MetalLb
    MetallbIpRange: 'metallbCidr',
    // Azure AutoScaler
    minNumWorkers: 'numMinWorkers',
    maxNumWorkers: 'numMaxWorkers'

}

const coreDnsParams = ['dnsMemoryLimit', 'dnsDomain', 'base64EncAdditionalDnsConfig']
const metalLbParams = ['MetallbIpRange']
const metricsServerParams = []
const kubernetesDashboardParams = []
const awsAutoScalerParams = []
const azureAutoScalerParams = ['minNumWorkers', 'maxNumWorkers']

export const getAddonParams = (addonType) => objSwitchCase(
  {
    [ClusterAddonType.MetricsServer]: metricsServerParams,
    [ClusterAddonType.KubernetesDashboard]: kubernetesDashboardParams,
    [ClusterAddonType.CoreDns]: coreDnsParams,
    [ClusterAddonType.MetalLb]: metalLbParams,
    [ClusterAddonType.AzureAutoScaler]: azureAutoScalerParams,
    [ClusterAddonType.AwsAutoScaler]: awsAutoScalerParams,
  }, [])(addonType)

export const getCoreDnsRequestBody = ({
  clusterId,
  dnsMemoryLimit,
  dnsDomain,
  additionalDnsConfig,
}) => {
  return {
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
}}

export const getMetalLbRequestbody = ({ clusterId, metallbCidr }) => ({
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
      params: [{ name: 'MetallbIpRange', value: getMetalLbCidr(metallbCidr) }],
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

export const getAwsAutoScalerRequestBody = ({clusterId, region}) => ({
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
        { name: 'clusterRegion', value: region },
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

export const getAzureAutoScalerRequestBody = ({clusterId, numMinWorkers, numMaxWorkers}) => ({
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
        { name: 'minNumWorkers', value: numMinWorkers?.toString() },
        { name: 'maxNumWorkers', value: numMaxWorkers?.toString() },
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
      [ClusterAddonType.CoreDns]: getCoreDnsRequestBody({ clusterId, ...params }),
      [ClusterAddonType.MetalLb]: getMetalLbRequestbody({ clusterId, ...params }),
      [ClusterAddonType.AzureAutoScaler]: getAzureAutoScalerRequestBody({clusterId, ...params}),
      [ClusterAddonType.AwsAutoScaler]: getAwsAutoScalerRequestBody({ clusterId, ...params })
    },
    {},
  )(addonType)
