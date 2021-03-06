export const importedClusterStatusMap = {
  Pending: 'pause',
  Running: 'ok',
  Terminating: 'loading',
  Failing: 'fail',
  '': 'unknown',
}

export interface ImportedClusterSelector extends ImportedCluster {
  name: ImportedCluster['spec']['displayName']
  cloudProviderId: ImportedCluster['spec']['cloudProviderID']
  external: ImportedCluster['metadata']['labels']['external']
  region: ImportedCluster['metadata']['labels']['region']
  kubeVersion: ImportedCluster['spec']['kubeVersion']
  creationTimestamp: ImportedCluster['metadata']['creationTimestamp']
  containerCidr: ImportedCluster['spec']['eks']['network']['containerCidr']
  servicesCidr: ImportedCluster['spec']['eks']['network']['servicesCidr']
  nodeGroups: ImportedCluster['spec']['eks']['nodegroups']
  agentPools: ImportedCluster['spec']['aks']['agentPools']
  providerType: string
  hasPrometheus: boolean
}

export interface ImportedCluster {
  uuid: string
  metadata: ItemMetadata
  spec: Spec
  status: Status
}

export interface ItemMetadata {
  name: string
  namespace: string
  selfLink: string
  uid: string
  resourceVersion: string
  creationTimestamp: string
  labels: MetadataLabels
  managedFields: ManagedField[]
}

export interface MetadataLabels {
  cloudProviderID: string
  external: string
  id: string
  projectID: string
  provider: string
  region?: string
  location?: string
}

export interface ManagedField {
  manager: string
  operation: string
  apiVersion: string
  time: string
  fieldsType: string
  fieldsV1: FieldsV1
}

export interface FieldsV1 {
  'f:metadata': FMetadata
  'f:spec': FSpec
  'f:status': FStatus
}

export interface FMetadata {
  'f:labels': FLabels
}

export interface FLabels {
  '.': EmptyObj
  'f:cloudProviderID': EmptyObj
  'f:external': EmptyObj
  'f:id': EmptyObj
  'f:projectID': EmptyObj
  'f:provider': EmptyObj
  'f:region': EmptyObj
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface EmptyObj {}

export interface FSpec {
  'f:cloudProviderID': EmptyObj
  'f:displayName': EmptyObj
  'f:eks': FEks
  'f:external': EmptyObj
  'f:kubeVersion': EmptyObj
  'f:projectID': EmptyObj
}

export interface FEks {
  '.': EmptyObj
  'f:ca': EmptyObj
  'f:createdAt': EmptyObj
  'f:eksVersion': EmptyObj
  'f:iamRole': EmptyObj
  'f:kubernetesVersion': EmptyObj
  'f:logging': FLogging
  'f:network': FNetwork
  'f:region': EmptyObj
  'f:status': EmptyObj
  'f:tags'?: { [key: string]: EmptyObj }
  'f:nodegroups'?: EmptyObj
}

export interface FLogging {
  '.': EmptyObj
  'f:clusterLogging': EmptyObj
}

export interface FNetwork {
  '.': EmptyObj
  'f:containerCidr': EmptyObj
  'f:servicesCidr': EmptyObj
  'f:vpc': FVpc
}

export interface FVpc {
  '.': EmptyObj
  'f:clusterSecurityGroupId'?: EmptyObj
  'f:privateAccess': EmptyObj
  'f:publicAccess': EmptyObj
  'f:subnets': EmptyObj
  'f:vpcId': EmptyObj
}

export interface FStatus {
  'f:controlPlaneEndpoint': EmptyObj
  'f:message': EmptyObj
  'f:phase': EmptyObj
  'f:workers'?: EmptyObj
}

export interface Spec {
  cloudProviderID: string
  projectID: string
  kubeVersion: string
  clusterNetwork: EmptyObj
  kubeproxy: EmptyObj
  kubelet: EmptyObj
  containerRuntime: ContainerRuntime
  loadBalancer: LoadBalancer
  storageBackend: StorageBackend
  auth: Auth
  ha: Ha
  scheduler: EmptyObj
  controllerManager: EmptyObj
  apiserver: EmptyObj
  controlPlaneEndpoint: EmptyObj
  cni: Cni
  addons: Addons
  pf9: EmptyObj
  displayName: string
  external: boolean
  eks?: Eks
  aks?: Aks
  gke?: Gke
}

export interface Addons {
  appCatalog: EmptyObj
  cas: EmptyObj
  luigi: EmptyObj
  kubevirt: EmptyObj
  cpuManager: EmptyObj
}

export interface Auth {
  keystone: EmptyObj
}

export interface Cni {
  calico: EmptyObj
  flannel: EmptyObj
}

export interface ContainerRuntime {
  docker: EmptyObj
}

export interface Eks {
  region: string
  kubernetesVersion: string
  eksVersion: string
  createdAt: string
  status: string
  ca: string
  iamRole: string
  network: EksNetwork
  logging: Logging
  tags?: EksTags
  nodegroups?: Nodegroup[]
}

export interface Logging {
  clusterLogging: ClusterLogging[]
}

export interface ClusterLogging {
  types: Type[]
  enabled?: boolean
}

export enum Type {
  API = 'api',
  Audit = 'audit',
  Authenticator = 'authenticator',
  ControllerManager = 'controllerManager',
  Scheduler = 'scheduler',
}

export interface EksNetwork {
  containerCidr: string[]
  servicesCidr: string
  vpc: Vpc
}

export interface Vpc {
  vpcId: string
  publicAccess: boolean
  privateAccess: boolean
  clusterSecurityGroupId?: string
  subnets: string[]
}

export interface Nodegroup {
  name: string
  arn: string
  kubernetesVersion: string
  createdAt: string
  updatedAt: string
  status: string
  capacityType: string
  instanceTypes: InstanceType[]
  subnets: string[]
  ami: string
  tags?: NodegroupTags
  labels?: NodegroupLabels
  sshKey: string
  scalingConfig: ScalingConfig
  iamRole: string
  instances: Instance[]
}

export enum InstanceType {
  T3Large = 't3.large',
  T3Medium = 't3.medium',
}

export interface Instance {
  instanceId: string
  availabilityZone: string
  instanceType: InstanceType
  network: InstanceNetwork
}

export interface InstanceNetwork {
  privateDnsName: string
  publicDnsName: string
  privateIpAddress: string
  publicIpAddress: string
  vpcId: VpcID
}

export enum VpcID {
  Vpc51F33B37 = 'vpc-51f33b37',
}

export interface NodegroupLabels {
  demo: string
}

export interface ScalingConfig {
  minSize: number
  maxSize: number
  desiredSize: number
}

export interface NodegroupTags {
  creator: string
}

export interface EksTags {
  createdBy?: string
  newcluster?: string
  purpose?: string
  user?: string
  creator?: string
  demo?: string
  CreatedBy?: string
  DemoTag?: string
}

export interface Ha {
  keepalived: EmptyObj
}

export interface LoadBalancer {
  metallb: EmptyObj
}

export interface StorageBackend {
  etcd: EmptyObj
}

export interface Status {
  phase: string
  message: string
  controlPlaneEndpoint: string
  workers?: number
}

export interface ImportedClusterMetadata {
  selfLink: string
  resourceVersion: string
}

export interface Aks {
  location: string
  kubernetesVersion: string
  type: string
  provisioningState: string
  powerState: string
  enableRBAC: boolean
  maxAgentPools: number
  nodeResourceGroup: string
  network: Network
  agentPools: AgentPool[]
  instances: AksInstance[]
  servicePrincipalClientID: string
  dnsPrefix: string
  tags: AksTags
  fqdn: string
  enablePrivateCluster?: boolean
}

export interface AgentPool {
  name: string
  count: number
  vmSize: string
  osDiskSizeGB: number
  osDiskType: string
  maxPods: number
  type: string
  availabilityZones: string[]
  provisioningState: string
  powerState: string
  kubernetesVersion: string
  mode: string
  osType: string
  nodeImageVersion: string
  vnetSubnetID: string
}

export interface AksInstance {
  name: string
  location: string
  instanceId: string
  vmId: string
  zones: string[]
  sku: Sku
  virtualMachineScaleSetName: string
  agentPoolName: string
  tags: InstanceTags
  networkInterfaces: string[]
  osProfile: OSProfile
}

export interface OSProfile {
  computerName: string
  adminUsername: string
  linuxConfiguration: LinuxConfiguration
}

export interface LinuxConfiguration {
  sshKeys: SSHKey[]
  disablePasswordAuthentication: boolean
  provisionVMAgent: boolean
}

export interface SSHKey {
  keyData: string
  path: string
}

export interface Sku {
  name: string
  tier: string
}

export interface InstanceTags {
  aksEngineVersion?: string
  creationSource: string
  orchestrator: string
  poolName: string
  resourceNameSuffix: string
  createOperationID?: string
}

export interface Network {
  plugin: string
  policy: string
  serviceCIDR: string
  containerCIDR: string
  dnsServiceIP: string
  outboundType: string
  loadBalancerSKU: string
  loadBalancerProfile: LoadBalancerProfile
}

export interface LoadBalancerProfile {
  managedOutboundIPs: number
  effectiveOutboundIPs: string[]
}

export interface AksTags {
  [key: string]: string
}

export interface Gke {
  locations: string[]
  id: string
  clusterCaCertificate: string
  initialClusterVersion: string
  releaseChannel: string
  databaseEncryption: string
  network: GkeNetwork
  nodePools: NodePool[]
  privateCluster: boolean
}

export interface GkeNetwork {
  useIpAliases: boolean
  network: string
  subnetwork: string
  podIpv4CIDR: string
  servicesIpv4CIDR: string
  networkPolicyConfig: boolean
}

export interface NodePool {
  name: string
  diskSizeGb: number
  machineType: string
  imageType: string
  diskType: string
  nodeCount: number
  maxPodsPerNode: string
  status: string
  k8sVersion: string
  locations: string[]
  instances: GkeInstance[]
}

export interface GkeInstance {
  name: string
  status: string
  id: string
  location: string
  instanceTemplate: string
  instanceGroupName: string
}
