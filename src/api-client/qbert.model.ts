import { CustomerMetadata } from './model'

// Keep these for now, this way we can easily see which have had types generated
// export interface Qbert {
//   getNodes: Node[]
//   getClusters: ClusterElement[]
//   getKubernetesVersion: GetKubernetesVersion
//   getCloudProviders: GetCloudProvider[]
//   getClusterDeployments: GetClusterDeployments
//   getClusterKubeServices: GetClusterKubeServices
//   getClusterPods: GetClusterPods
//   getClusterNamespaces: GetClusterNamespaces
//   getClusterStorageClasses: GetCluster
//   getPrometheusAlerts: GetPrometheusAlerts
//   getPrometheusAlertsOverTime: GetPrometheusAlertsOverTime
//   getClusterRoles: GetClusterRoles
//   getClusterClusterRoles: GetClusterClusterRoles
//   getClusterRoleBindings: GetCluster
//   getClusterClusterRoleBindings: GetCluster
//   getKubeConfig: string
// }
// type Merge<A, B> = { [K in keyof A]: K extends keyof B ? B[K] : A[K] } & B extends infer O
//   ? { [K in keyof O]: O[K] }
//   : never

export interface IGenericPayloadWithMetadata {
  metadata: any
}

export type IGenericClusterizedResponse<T> = T & { clusterId: string }
export interface GCluster<T> {
  items: T[]
}

export interface INormalizedCluster {
  endpoint: string
  kubeconfigUrl: string
  isUpgrading: boolean
  nodes: Node[]
}

export type IGenericResource<T> = T & {
  clusterId: string
  name: string
  created: string
  id: string
  namespace: string
}

export interface GetCloudProvider {
  name: string
  type: string
  uuid: string
  nodePoolUuid: string
}

export interface GetCluster {
  kind: string
  apiVersion: string
  metadata: GetClusterClusterRoleBindingsMetadata
  items: GetClusterClusterRoleBindingsItem[]
}

export interface GetClusterClusterRoleBindingsItem {
  parameters: { type: string }
  metadata: PurpleMetadata
  subjects?: RoleRef[]
  roleRef: RoleRef
}

export interface PurpleMetadata {
  name: string
  selfLink: string
  uid: string
  resourceVersion: string
  creationTimestamp: string
  annotations?: PurpleAnnotations
  labels?: { [key: string]: string }
  namespace?: NamespaceEnum
  ownerReferences?: OwnerReference[]
}

export interface PurpleAnnotations {
  'rbac.authorization.kubernetes.io/autoupdate'?: string
  'kubectl.kubernetes.io/last-applied-configuration'?: string
}

export enum NamespaceEnum {
  Default = 'default',
  KubeNodeLease = 'kube-node-lease',
  KubePublic = 'kube-public',
  KubeSystem = 'kube-system',
  KubernetesDashboard = 'kubernetes-dashboard',
  Pf9Monitoring = 'pf9-monitoring',
  Pf9Olm = 'pf9-olm',
  Pf9Operators = 'pf9-operators',
  Platform9System = 'platform9-system',
}

export interface OwnerReference {
  apiVersion: APIVersion
  kind: string
  name: string
  uid: string
  controller?: boolean
  blockOwnerDeletion?: boolean
}

export enum APIVersion {
  AppsV1 = 'apps/v1',
  MonitoringCoreosCOMV1 = 'monitoring.coreos.com/v1',
  OperatorsCoreosCOMV1Alpha1 = 'operators.coreos.com/v1alpha1',
  V1 = 'v1',
}

export interface RoleRef {
  apiGroup?: APIGroup
  kind: Kind
  name: string
  namespace?: NamespaceEnum
}

export enum APIGroup {
  APIGroup = '*',
  ApiextensionsK8SIo = 'apiextensions.k8s.io',
  Apps = 'apps',
  AuthenticationK8SIo = 'authentication.k8s.io',
  AuthorizationK8SIo = 'authorization.k8s.io',
  Autoscaling = 'autoscaling',
  Batch = 'batch',
  CertificatesK8SIo = 'certificates.k8s.io',
  CoordinationK8SIo = 'coordination.k8s.io',
  CustomMetricsK8SIo = 'custom.metrics.k8s.io',
  Empty = '',
  EventsK8SIo = 'events.k8s.io',
  Extensions = 'extensions',
  MetricsK8SIo = 'metrics.k8s.io',
  MonitoringCoreosCOM = 'monitoring.coreos.com',
  NetworkingK8SIo = 'networking.k8s.io',
  NodeK8SIo = 'node.k8s.io',
  OperatorsCoreosCOM = 'operators.coreos.com',
  PackagesOperatorsCoreosCOM = 'packages.operators.coreos.com',
  Policy = 'policy',
  RbacAuthorizationK8SIo = 'rbac.authorization.k8s.io',
  StorageK8SIo = 'storage.k8s.io',
}

export enum Kind {
  ClusterRole = 'ClusterRole',
  Group = 'Group',
  Role = 'Role',
  ServiceAccount = 'ServiceAccount',
  User = 'User',
}

export interface GetClusterClusterRoleBindingsMetadata {
  selfLink: string
  resourceVersion: string
}

export interface GetClusterClusterRoles {
  kind: string
  apiVersion: string
  metadata: GetClusterClusterRoleBindingsMetadata
  items: GetClusterClusterRolesItem[]
}

export interface GetClusterClusterRolesItem {
  metadata: FluffyMetadata
  rules: ItemRule[]
  aggregationRule?: AggregationRule
}

export interface AggregationRule {
  clusterRoleSelectors: ClusterRoleSelector[]
}

export interface ClusterRoleSelector {
  matchLabels: MatchLabels
}

export interface MatchLabels {
  'rbac.authorization.k8s.io/aggregate-to-admin'?: string
  'rbac.authorization.k8s.io/aggregate-to-edit'?: string
  'olm.opgroup.permissions/aggregate-to-admin'?: string
  'olm.opgroup.permissions/aggregate-to-edit'?: string
  'olm.opgroup.permissions/aggregate-to-view'?: string
  'rbac.authorization.k8s.io/aggregate-to-view'?: string
}

export interface FluffyMetadata {
  name: string
  selfLink: string
  uid: string
  resourceVersion: string
  creationTimestamp: string
  labels?: { [key: string]: string }
  annotations?: PurpleAnnotations
}

export interface ItemRule {
  verbs: Verb[]
  apiGroups?: APIGroup[]
  resources?: string[]
  resourceNames?: string[]
  nonResourceURLs?: string[]
}

export enum Verb {
  Create = 'create',
  Delete = 'delete',
  Deletecollection = 'deletecollection',
  Empty = '*',
  Get = 'get',
  Impersonate = 'impersonate',
  List = 'list',
  Patch = 'patch',
  Proxy = 'proxy',
  Update = 'update',
  Watch = 'watch',
}

export interface GetClusterDeployments {
  kind: string
  apiVersion: APIVersion
  metadata: GetClusterClusterRoleBindingsMetadata
  items: GetClusterDeploymentsItem[]
}

export interface GetClusterDeploymentsItem {
  metadata: TentacledMetadata
  spec: PurpleSpec
  status: PurpleStatus
}

export interface TentacledMetadata {
  name: string
  namespace: NamespaceEnum
  selfLink: string
  uid: string
  resourceVersion: string
  generation: number
  creationTimestamp: string
  labels?: { [key: string]: string }
  annotations: FluffyAnnotations
  ownerReferences?: OwnerReference[]
}

export interface FluffyAnnotations {
  'deployment.kubernetes.io/revision': string
  'kubectl.kubernetes.io/last-applied-configuration'?: string
}

export interface PurpleSpec {
  replicas: number
  selector: PurpleSelector
  template: Template
  strategy: Strategy
  revisionHistoryLimit: number
  progressDeadlineSeconds: number
}

export interface PurpleSelector {
  matchLabels: MatchLabelsClass
}

export interface MatchLabelsClass {
  [key: string]: string
  app?: string
  'k8s-app'?: string
  version?: string
}

export interface Strategy {
  type: StrategyType
  rollingUpdate: RollingUpdate
}

export interface RollingUpdate {
  maxUnavailable: Max | number
  maxSurge: Max
}

export enum Max {
  The25 = '25%',
}

export enum StrategyType {
  RollingUpdate = 'RollingUpdate',
}

export interface Template {
  metadata: TemplateMetadata
  spec: TemplateSpec
}

export interface TemplateMetadata {
  creationTimestamp: null
  labels: MatchLabelsClass
  annotations?: { [key: string]: string }
  name?: string
}

export interface TemplateSpec {
  volumes?: Volume[]
  containers: PurpleContainer[]
  restartPolicy: Policy
  terminationGracePeriodSeconds: number
  dnsPolicy: DNSPolicy
  nodeSelector?: NodeSelector
  serviceAccountName?: string
  serviceAccount?: string
  securityContext: SpecSecurityContext
  schedulerName: SchedulerName
  tolerations?: Toleration[]
  affinity?: PurpleAffinity
  priorityClassName?: string
}

export interface PurpleAffinity {
  nodeAffinity: PurpleNodeAffinity
}

export interface PurpleNodeAffinity {
  preferredDuringSchedulingIgnoredDuringExecution: PreferredDuringSchedulingIgnoredDuringExecution[]
}

export interface PreferredDuringSchedulingIgnoredDuringExecution {
  weight: number
  preference: Preference
}

export interface Preference {
  matchExpressions: MatchExpression[]
}

export interface MatchExpression {
  key: Key
  operator: Operator
}

export enum Key {
  NodeKubernetesIoDiskPressure = 'node.kubernetes.io/disk-pressure',
  NodeKubernetesIoMemoryPressure = 'node.kubernetes.io/memory-pressure',
  NodeKubernetesIoNetworkUnavailable = 'node.kubernetes.io/network-unavailable',
  NodeKubernetesIoNotReady = 'node.kubernetes.io/not-ready',
  NodeKubernetesIoPIDPressure = 'node.kubernetes.io/pid-pressure',
  NodeKubernetesIoUnreachable = 'node.kubernetes.io/unreachable',
  NodeKubernetesIoUnschedulable = 'node.kubernetes.io/unschedulable',
  NodeRoleKubernetesIoMaster = 'node-role.kubernetes.io/master',
}

export enum Operator {
  Equal = 'Equal',
  Exists = 'Exists',
}

export interface PurpleContainer {
  name: string
  image: string
  command?: string[]
  env?: Env[]
  resources: Resources
  volumeMounts?: VolumeMount[]
  terminationMessagePath: TerminationMessagePath
  terminationMessagePolicy: TerminationMessagePolicy
  imagePullPolicy: Policy
  args?: string[]
  ports?: ContainerPort[]
  livenessProbe?: LivenessProbe
  readinessProbe?: ReadinessProbe
  securityContext?: ContainerSecurityContext
}

export interface Env {
  name: string
  value?: string
  valueFrom?: ValueFrom
}

export interface ValueFrom {
  fieldRef: FieldRef
}

export interface FieldRef {
  apiVersion: APIVersion
  fieldPath: string
}

export enum Policy {
  Always = 'Always',
  IfNotPresent = 'IfNotPresent',
}

export interface LivenessProbe {
  httpGet: PurpleHTTPGet
  initialDelaySeconds?: number
  timeoutSeconds: number
  periodSeconds: number
  successThreshold: number
  failureThreshold: number
}

export interface PurpleHTTPGet {
  path: string
  port: number
  scheme: Scheme
}

export enum Scheme {
  HTTP = 'HTTP',
  HTTPS = 'HTTPS',
}

export interface ContainerPort {
  name?: string
  containerPort: number
  protocol: Protocol
  hostPort?: number
}

export enum Protocol {
  TCP = 'TCP',
  UDP = 'UDP',
}

export interface ReadinessProbe {
  httpGet: ReadinessProbeHTTPGet
  timeoutSeconds: number
  periodSeconds: number
  successThreshold: number
  failureThreshold: number
}

export interface ReadinessProbeHTTPGet {
  path: string
  port: number | string
  scheme: Scheme
}

export interface Resources {
  limits?: Limits
  requests?: Limits
}

export interface Limits {
  cpu?: string
  memory: string
}

export interface ContainerSecurityContext {
  capabilities?: Capabilities
  readOnlyRootFilesystem: boolean
  allowPrivilegeEscalation: boolean
  runAsUser?: number
  runAsGroup?: number
}

export interface Capabilities {
  add: string[]
  drop: string[]
}

export enum TerminationMessagePath {
  DevTerminationLog = '/dev/termination-log',
}

export enum TerminationMessagePolicy {
  FallbackToLogsOnError = 'FallbackToLogsOnError',
  File = 'File',
}

export interface VolumeMount {
  name: string
  readOnly?: boolean
  mountPath: string
  subPath?: string
  mountPropagation?: string
}

export enum DNSPolicy {
  ClusterFirst = 'ClusterFirst',
  Default = 'Default',
}

export interface NodeSelector {
  'node-role.kubernetes.io/master'?: string
  'beta.kubernetes.io/os'?: KubernetesIoOS
  'kubernetes.io/os'?: KubernetesIoOS
}

export enum KubernetesIoOS {
  Linux = 'linux',
}

export enum SchedulerName {
  DefaultScheduler = 'default-scheduler',
}

export interface SpecSecurityContext {
  runAsUser?: number
  runAsNonRoot?: boolean
}

export interface Toleration {
  key?: Key
  operator?: Operator
  value?: string
  effect?: Effect
  tolerationSeconds?: number
}

export enum Effect {
  NoExecute = 'NoExecute',
  NoSchedule = 'NoSchedule',
}

export interface Volume {
  name: string
  hostPath?: HostPath
  configMap?: ConfigMap
  secret?: Secret
  emptyDir?: CustomerMetadata
}

export interface ConfigMap {
  name: string
  items?: ConfigMapItem[]
  defaultMode: number
}

export interface ConfigMapItem {
  key: string
  path: string
}

export interface HostPath {
  path: string
  type: string
}

export interface Secret {
  secretName: string
  defaultMode: number
  items?: ConfigMapItem[]
}

export interface PurpleStatus {
  observedGeneration: number
  replicas: number
  updatedReplicas: number
  readyReplicas: number
  availableReplicas: number
  conditions: Condition[]
}

export interface Condition {
  type: ConditionType
  status: StatusEnum
  lastUpdateTime?: string
  lastTransitionTime: string
  reason?: Reason
  message?: string
  lastProbeTime?: null
}

export enum Reason {
  ContainersNotReady = 'ContainersNotReady',
  MinimumReplicasAvailable = 'MinimumReplicasAvailable',
  NewReplicaSetAvailable = 'NewReplicaSetAvailable',
}

export enum StatusEnum {
  False = 'False',
  True = 'True',
}

export enum ConditionType {
  Available = 'Available',
  ContainersReady = 'ContainersReady',
  Initialized = 'Initialized',
  PodScheduled = 'PodScheduled',
  Progressing = 'Progressing',
  Ready = 'Ready',
}

export interface GetClusterKubeServices {
  kind: string
  apiVersion: APIVersion
  metadata: GetClusterClusterRoleBindingsMetadata
  items: GetClusterKubeServicesItem[]
}

export interface GetClusterKubeServicesItem {
  metadata: StickyMetadata
  spec: FluffySpec
  status: FluffyStatus
}

export interface StickyMetadata {
  name: string
  namespace: NamespaceEnum
  selfLink: string
  uid: string
  resourceVersion: string
  creationTimestamp: string
  labels?: PurpleLabels
  annotations?: TentacledAnnotations
  ownerReferences?: OwnerReference[]
}

export interface TentacledAnnotations {
  'kubectl.kubernetes.io/last-applied-configuration'?: string
  'prometheus.io/port'?: string
  'prometheus.io/scrape'?: string
  created_by?: string
}

export interface PurpleLabels {
  component?: string
  provider?: string
  'addonmanager.kubernetes.io/mode'?: string
  'k8s-app'?: string
  'kubernetes.io/cluster-service'?: string
  'kubernetes.io/name'?: string
  'operated-alertmanager'?: string
  app?: string
  'operated-prometheus'?: string
}

export interface FluffySpec {
  ports: SpecPort[]
  clusterIP: string
  type: SpecType
  sessionAffinity: SessionAffinity
  selector?: FluffySelector
  externalName?: string
}

export interface SpecPort {
  name?: string
  protocol: Protocol
  port: number
  targetPort: number | string
  nodePort?: number | string
}

export interface FluffySelector {
  'k8s-app'?: string
  app?: string
  alertmanager?: string
  prometheus?: string
  'olm.catalogSource'?: string
}

export enum SessionAffinity {
  None = 'None',
}

export enum SpecType {
  ClusterIP = 'ClusterIP',
  NodePort = 'NodePort',
  LoadBalancer = 'LoadBalancer',
}

export interface FluffyStatus {
  loadBalancer: CustomerMetadata
}

export interface GetClusterNamespaces {
  kind: string
  apiVersion: APIVersion
  metadata: GetClusterClusterRoleBindingsMetadata
  items: GetClusterNamespacesItem[]
}

export interface GetClusterNamespacesItem {
  metadata: IndigoMetadata
  spec: TentacledSpec
  status: TentacledStatus
}

export interface IndigoMetadata {
  name: NamespaceEnum
  selfLink: string
  uid: string
  resourceVersion: string
  creationTimestamp: string
  annotations?: StickyAnnotations
}

export interface StickyAnnotations {
  'kubectl.kubernetes.io/last-applied-configuration': string
}

export interface TentacledSpec {
  finalizers: string[]
}

export interface TentacledStatus {
  phase: string
}

export interface GetClusterPods {
  kind: string
  apiVersion: APIVersion
  metadata: GetClusterClusterRoleBindingsMetadata
  items: GetClusterPodsItem[]
}

export interface GetClusterPodsItem {
  metadata: IndecentMetadata
  spec: StickySpec
  status: StickyStatus
}

export interface IndecentMetadata {
  name: string
  generateName?: string
  namespace: NamespaceEnum
  selfLink: string
  uid: string
  resourceVersion: string
  creationTimestamp: string
  labels?: { [key: string]: string }
  ownerReferences?: OwnerReference[]
  annotations?: { [key: string]: string }
}

export interface StickySpec {
  volumes: Volume[]
  containers: FluffyContainer[]
  restartPolicy: Policy
  terminationGracePeriodSeconds: number
  dnsPolicy: DNSPolicy
  nodeSelector?: NodeSelector
  serviceAccountName?: string
  serviceAccount?: string
  nodeName: NodeName
  securityContext: SpecSecurityContext
  schedulerName: SchedulerName
  tolerations: Toleration[]
  priority: number
  enableServiceLinks: boolean
  affinity?: FluffyAffinity
  priorityClassName?: string
  hostNetwork?: boolean
  hostname?: string
  subdomain?: string
  hostPID?: boolean
}

export interface FluffyAffinity {
  nodeAffinity: FluffyNodeAffinity
}

export interface FluffyNodeAffinity {
  preferredDuringSchedulingIgnoredDuringExecution?: PreferredDuringSchedulingIgnoredDuringExecution[]
  requiredDuringSchedulingIgnoredDuringExecution?: RequiredDuringSchedulingIgnoredDuringExecution
}

export interface RequiredDuringSchedulingIgnoredDuringExecution {
  nodeSelectorTerms: NodeSelectorTerm[]
}

export interface NodeSelectorTerm {
  matchFields: MatchField[]
}

export interface MatchField {
  key: string
  operator: string
  values: NodeName[]
}

export enum NodeName {
  IP1001148UsWest2ComputeInternal = 'ip-10-0-1-148.us-west-2.compute.internal',
  IP1001249UsWest2ComputeInternal = 'ip-10-0-1-249.us-west-2.compute.internal',
  IP100132UsWest2ComputeInternal = 'ip-10-0-1-32.us-west-2.compute.internal',
  IP10015UsWest2ComputeInternal = 'ip-10-0-1-5.us-west-2.compute.internal',
}

export interface FluffyContainer {
  name: string
  image: string
  command?: string[]
  env?: Env[]
  resources: Resources
  volumeMounts?: VolumeMount[]
  terminationMessagePath: TerminationMessagePath
  terminationMessagePolicy: TerminationMessagePolicy
  imagePullPolicy: Policy
  args?: string[]
  ports?: ContainerPort[]
  livenessProbe?: NessProbe
  readinessProbe?: NessProbe
  securityContext?: ContainerSecurityContext
}

export interface NessProbe {
  httpGet?: ReadinessProbeHTTPGet
  initialDelaySeconds?: number
  timeoutSeconds: number
  periodSeconds: number
  successThreshold: number
  failureThreshold: number
  exec?: Exec
}

export interface Exec {
  command: string[]
}

export interface StickyStatus {
  phase: Phase
  conditions: Condition[]
  hostIP: HostIP
  podIP: string
  podIPs: PodIP[]
  startTime: string
  containerStatuses: ContainerStatus[]
  qosClass: QosClass
}

export interface ContainerStatus {
  name: string
  state: State
  lastState: LastState
  ready: boolean
  restartCount: number
  image: string
  imageID: string
  containerID: string
  started: boolean
}

export interface LastState {
  terminated?: Terminated
}

export interface Terminated {
  exitCode: number
  reason: string
  startedAt: string
  finishedAt: string
  containerID: string
}

export interface State {
  running?: Running
  waiting?: Waiting
}

export interface Running {
  startedAt: string
}

export interface Waiting {
  reason: string
  message: string
}

export enum HostIP {
  The1001148 = '10.0.1.148',
  The1001249 = '10.0.1.249',
  The100132 = '10.0.1.32',
  The10015 = '10.0.1.5',
}

export enum Phase {
  Running = 'Running',
}

export interface PodIP {
  ip: string
}

export enum QosClass {
  BestEffort = 'BestEffort',
  Burstable = 'Burstable',
  Guaranteed = 'Guaranteed',
}

export interface GetClusterRoles {
  kind: string
  apiVersion: string
  metadata: GetClusterClusterRoleBindingsMetadata
  items: GetClusterRolesItem[]
}

export interface GetClusterRolesItem {
  metadata: PurpleMetadata
  rules: ItemRule[]
}

export interface ClusterElement {
  name: string
  uuid: string
  canUpgrade: boolean
  containersCidr: string
  created_at: string
  servicesCidr: string
  isKubernetes: number
  isSwarm: number
  isMesos: number
  masterIp: string
  externalDnsName: string
  debug: string
  status: string
  flannelIfaceLabel: string
  flannelPublicIfaceLabel: string
  dockerRoot: string
  etcdDataDir: string
  lastOp: null | string
  lastOk: null | string
  keystoneEnabled: number
  authzEnabled: number
  taskStatus: string
  taskError: string
  kubeProxyMode: string
  numMasters: number
  numWorkers: number
  privileged: number
  appCatalogEnabled: number
  projectId: string
  runtimeConfig: string
  networkPlugin: string
  allowWorkloadsOnMaster: number
  enableMetallb: number
  metallbCidr: string
  masterVipIpv4: string
  masterVipVrouterId: string
  masterVipIface: string
  k8sApiPort: string
  mtuSize: string
  calicoV4BlockSize: string
  calicoIpIpMode: string
  calicoNatOutgoing: number
  masterless: number
  etcdVersion: string
  apiserverStorageBackend: string
  enableCAS: number
  numMinWorkers: number
  numMaxWorkers: number
  etcdHeartbeatIntervalMs: string
  etcdElectionTimeoutMs: string
  masterStatus: string
  workerStatus: string
  kubeRoleVersion: string
  nodePoolUuid: string
  nodePoolName: string
  cloudProviderUuid: string
  cloudProviderName: string
  cloudProviderType: string
  cloudProperties: { [key: string]: string }
  tags: Tags
  etcdBackup: EtcdBackup
}

export interface EtcdBackup {
  isEtcdBackupEnabled: number
  intervalInMins: number
  storageType: string
  storageProperties: StorageProperties | null
  taskStatus: string
  taskErrorDetail: string
}

export interface StorageProperties {
  localPath: string
}

export interface Tags {
  'pf9-system:monitoring': string
  test?: string
  'pf9-system:'?: string
}

export interface GetKubernetesVersion {
  major: string
  minor: string
  gitVersion: string
  gitCommit: string
  gitTreeState: string
  buildDate: string
  goVersion: string
  compiler: string
  platform: string
}

export interface Node {
  name: string
  uuid: string
  primaryIp: string
  isMaster: number
  masterless: number
  status: string
  api_responding: number
  projectId: string
  startKube: number
  actualKubeRoleVersion: string
  nodePoolUuid: string
  nodePoolName: string
  clusterUuid: null | string
  clusterName: null | string
  cloudProviderType: string
  clusterKubeRoleVersion: string
}

export interface GetPrometheusAlerts {
  status: string
  data: GetPrometheusAlertsData
}

export interface GetPrometheusAlertsData {
  alerts: Alert[]
}

export interface GetPrometheusAlertRules {
  groups: Group[]
}

export interface Group {
  name: string
  file: string
  rules: GroupRule[]
  interval: number
}

export interface GroupRule {
  name: string
  query: string
  health: RoleStatus
  type: RuleType
  duration?: number
  labels?: RuleLabels
  annotations?: RuleAnnotations
  alerts?: Alert[]
}

export interface Alert {
  labels: { [key: string]: string }
  annotations: AlertAnnotations
  state: string
  activeAt: string
  value: number
}

export interface AlertAnnotations {
  message: string
  runbook_url?: string
}

export interface RuleAnnotations {
  message?: string
  runbook_url?: string
  description?: string
  summary?: string
}

export enum RoleStatus {
  Ok = 'ok',
}

export interface RuleLabels {
  exported_namespace: any
  alertname?: string
  severity?: Severity
  workload_type?: string
}

export enum Severity {
  Critical = 'critical',
  None = 'none',
  Warning = 'warning',
}

export enum RuleType {
  Alerting = 'alerting',
  Recording = 'recording',
}

export interface GetPrometheusAlertsOverTime {
  status: string
  data: GetPrometheusAlertsOverTimeData
}

export interface GetPrometheusAlertsOverTimeData {
  resultType: string
  result: Result[]
}

export interface Result {
  metric: { [key: string]: string }
  values: Array<[number, string]>
}

export interface IGetPrometheusAlertsOverTime {
  startTime: any
  endTime: any
  clusterId: any
  metric: {
    [key: string]: string
  }
  values: Array<[number, string]>
}
