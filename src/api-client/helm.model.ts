export interface Repository {
  repo: Repo
  clusters: Cluster[]
}

export interface Cluster {
  cluster_uuid: string
}

export interface Repo {
  ID: number
  name: string
  url: string
  username: string
  password: string
  certFile: string
  keyFile: string
  caFile: string
  forceUpdate: boolean
  allowDeprecatedRepos: boolean
  insecureSkipTLSverify: boolean
  deprecatedNoUpdate: boolean
  private: boolean
}

export interface App {
  Name: string
  Score: number
  Chart: Chart
}

export interface Chart {
  name: string
  home?: string
  sources?: string[]
  version: string
  description: string
  keywords: string[]
  maintainers?: Maintainer[]
  icon: string
  apiVersion: string
  appVersion: string
  annotations?: Annotations
  dependencies?: Dependency[]
  urls: string[]
  created: string
  digest: string
  deprecated?: boolean
  type?: string
}

export interface Annotations {
  category: string
}
export interface Dependency {
  name: string
  version: string
  repository: string
  tags?: string[]
  condition?: string
}

export interface Maintainer {
  name: string
  email?: string
  url?: string
}

export interface AppDetails {
  metadata: Metadata
  values: Values
  Readme: string
  Versions: string[]
}

export interface Metadata {
  name: string
  home: string
  sources: string[]
  version: string
  description: string
  keywords: string[]
  maintainers: Maintainer[]
  icon: string
  apiVersion: string
  appVersion: string
  annotations: Annotations
  dependencies: MetadataDependency[] | Dependency[]
}

export interface Annotations {
  category: string
}

export interface Dependency {
  name: string
  version: string
  repository: string
  tags?: string[]
}

export interface Maintainer {
  name: string
  email?: string
}

export interface Values {
  affinity: Affinity
  appFromExistingPVC: AppFromExistingPVC
  appFromExternalRepo: AppFromExternalRepo
  args: any[]
  autoscaling: Autoscaling
  bindURLs: string
  clusterDomain: string
  command: any[]
  commonAnnotations: Affinity
  commonLabels: Affinity
  containerPort: number
  containerSecurityContext: ContainerSecurityContext
  customLivenessProbe: Affinity
  customReadinessProbe: Affinity
  extraDeploy: any[]
  extraEnvVars: any[]
  extraVolumeMounts: any[]
  extraVolumes: any[]
  healthIngress: HealthIngress
  hostAliases: any[]
  image: Image
  ingress: Ingress
  initContainers: Affinity | any
  kubeVersion: null
  lifecycleHooks: Affinity
  livenessProbe: NessProbe
  nodeAffinityPreset: NodeAffinityPreset
  nodeSelector: Affinity
  pdb: Pdb
  podAffinityPreset: string
  podAnnotations: Affinity
  podAntiAffinityPreset: string
  podSecurityContext: PodSecurityContextClass | PodSecurityContext
  readinessProbe: NessProbe
  replicaCount: number
  resources: Resources
  service: PostgresqlService | Service
  serviceAccount: ServiceAccount
  sidecars: Affinity | any
  strategyType: string
  tolerations: any[]
}

export interface Affinity {}

export interface AppFromExistingPVC {
  enabled: boolean
}

export interface AppFromExternalRepo {
  clone: Clone
  enabled: boolean
  publish: Publish
  startCommand: string[]
}

export interface Clone {
  image: Image
  repository: string
  revision: string
}

export interface Image {
  pullPolicy: string
  registry: string
  repository: string
  tag: string
}

export interface Publish {
  extraFlags: any[]
  image: Image
  subFolder: string
}

export interface Autoscaling {
  enabled: boolean
  maxReplicas: number
  minReplicas: number
}

export interface ContainerSecurityContext {
  enabled: boolean
  runAsUser: number
}

export interface HealthIngress {
  annotations: Affinity | any
  certManager: boolean
  enabled: boolean
  hostname: string
  secrets: any[]
  tls: boolean
}

export interface Ingress {
  annotations: Affinity | any
  apiVersion: null
  certManager: boolean
  enabled: boolean
  hostname: string
  path: string
  pathType: string
  secrets: any
  tls: boolean
}

export interface NessProbe {
  enabled: boolean
  failureThreshold: number
  initialDelaySeconds: number
  periodSeconds: number
  successThreshold: number
  timeoutSeconds: number
}

export interface NodeAffinityPreset {
  key: string
  type: string
  values: any[]
}

export interface Pdb {
  create: boolean
  minAvailable: number
}

export interface PodSecurityContext {
  enabled: boolean
  sysctls: Affinity
}

export interface Resources {
  limits: Affinity
  requests: Affinity
}

export interface Service {
  annotations: Affinity
  externalTrafficPolicy: string
  port: number
  type: string
}

export interface ServiceAccount {
  annotations: Affinity
  create: boolean
}

export interface DeployedApp {
  name: string
  chart: string
  chart_version: string
  description: string
  version: number
  namespace: string
  status: string
}

export interface AppsAvailableToCluster {
  Name: string
  Score: number
  Chart: Chart
}

export interface Chart {
  name: string
  home?: string
  sources?: string[]
  version: string
  description: string
  keywords: string[]
  maintainers?: Maintainer[]
  icon: string
  apiVersion: string
  appVersion: string
  annotations?: Annotations
  dependencies?: Dependency[]
  urls: string[]
  created: string
  digest: string
  deprecated?: boolean
  type?: string
}

export interface Annotations {
  category: string
}

export interface Dependency {
  name: string
  version: string
  repository: string
  tags?: string[]
  condition?: string
}

export interface Maintainer {
  name: string
  email?: string
  url?: string
}

export interface RepositoriesForCluster {
  ID: number
  name: string
  url: string
  username: string
  password: string
  certFile: string
  keyFile: string
  caFile: string
  forceUpdate: boolean
  allowDeprecatedRepos: boolean
  insecureSkipTLSverify: boolean
  deprecatedNoUpdate: boolean
  private: boolean
}

export interface DeployedAppDetails {
  name: string
  info: Info
  chart: Chart
  config: Config
  manifest: string
  version: number
  namespace: string
}

export interface Chart {
  metadata: Metadata
  lock: Lock
  templates: File[]
  values: Values
  schema: null
  files: File[]
}

export interface File {
  name: string
  data: string
}

export interface Lock {
  generated: string
  digest: string
  dependencies: LockDependency[]
}

export interface LockDependency {
  name: string
  version: string
  repository: string
}

export interface Metadata {
  name: string
  home: string
  sources: string[]
  version: string
  description: string
  keywords: string[]
  maintainers: Maintainer[]
  icon: string
  apiVersion: string
  appVersion: string
  annotations: MetadataAnnotations
  dependencies: MetadataDependency[] | Dependency[]
}

export interface MetadataAnnotations {
  category: string
}

export interface MetadataDependency {
  name: string
  version: string
  repository: string
  tags?: string[]
  enabled: boolean
  condition?: string
}

export interface Maintainer {
  name: string
  email?: string
}

export interface Values {
  affinity: LivingstoneSouthernWhiteFacedOwl
  auth: Auth
  common: ValuesCommon
  commonAnnotations: LivingstoneSouthernWhiteFacedOwl
  commonLabels: LivingstoneSouthernWhiteFacedOwl
  configurationConfigMap: null
  containerSecurityContext: ContainerSecurityContextClass
  dagsConfigMap: null
  executor: string
  externalDatabase: ExternalDatabase
  externalRedis: ExternalRedis
  extraDeploy: any[]
  extraEnvVars: any[]
  extraEnvVarsCM: null
  extraEnvVarsSecret: null
  fullnameOverride: null
  git: Git
  ingress: Ingress
  initContainers: Affinity | any
  kubeVersion: null
  ldap: ValuesLDAP
  loadExamples: boolean
  metrics: ValuesMetrics
  nameOverride: null
  networkPolicies: NetworkPolicies
  nodeAffinityPreset: NodeAffinityPreset
  nodeSelector: LivingstoneSouthernWhiteFacedOwl
  podAffinityPreset: string
  podAntiAffinityPreset: string
  podSecurityContext: PodSecurityContextClass | PodSecurityContext
  postgresql: ValuesPostgresql
  rbac: PspClass
  redis: ValuesRedis
  scheduler: Scheduler
  service: PostgresqlService | Service
  serviceAccount: ServiceAccount
  sidecars: Affinity | any
  tolerations: any[]
  web: Scheduler
  worker: Scheduler
}

export interface LivingstoneSouthernWhiteFacedOwl {}

export interface Auth {
  existingSecret: null
  fernetKey: null
  forcePassword: boolean
  password: null
  username: string
}

export interface ValuesCommon {
  exampleValue: string
  global: LivingstoneSouthernWhiteFacedOwl
}

export interface ContainerSecurityContextClass {
  enabled: boolean
  runAsUser: number
}

export interface ExternalDatabase {
  database: string
  existingSecret: null
  host: string
  password: null
  port: number
  user: string
}

export interface ExternalRedis {
  existingSecret: null
  host: string
  password: null
  port: number
  username: null
}

export interface Git {
  clone: Clone
  dags: Dags
  image: Image
  plugins: Dags
  sync: Clone
}

export interface Clone {
  args: null
  command: null
  extraEnvVars: null
  extraEnvVarsCM: null
  extraEnvVarsSecret: null
  extraVolumeMounts: null
  interval?: number
}

export interface Dags {
  enabled: boolean
  repositories: Repository[]
}

export interface Repository {
  branch: null
  name: null
  path: null
  repository: null
}

export interface Image {
  pullPolicy: string
  pullSecrets?: any[]
  registry: string
  repository: string
  tag: string
  debug?: boolean
}

export interface Ingress {
  annotations: Affinity | any
  apiVersion: null
  certManager: boolean
  enabled: boolean
  hosts: Host[]
  pathType: string
  secrets: any
}

export interface Host {
  name: string
  path: string
  tls: boolean
  tlsHosts: any[]
  tlsSecret: string
}

export interface ValuesLDAP {
  base: string
  binddn: string
  bindpw: string
  enabled: boolean
  tls: LDAPTLS
  uidField: string
  uri: string
}

export interface LDAPTLS {
  CAcertificateFilename: string
  CAcertificateSecret: string
  allowSelfSigned: boolean
  enabled: boolean
}

export interface ValuesMetrics {
  enabled: boolean
  hostAliases: any[]
  image: Image
  nodeSelector: LivingstoneSouthernWhiteFacedOwl
  podAnnotations: PodAnnotationsClass
  podLabels: LivingstoneSouthernWhiteFacedOwl
  resources: LivingstoneSouthernWhiteFacedOwl
  tolerations: any[]
}

export interface PodAnnotationsClass {
  'prometheus.io/port': string
  'prometheus.io/scrape': string
}

export interface NetworkPolicies {
  enabled: boolean
}

export interface NodeAffinityPreset {
  key: string
  type: string
  values: any[]
}

export interface PodSecurityContextClass {
  enabled: boolean
  fsGroup: number
}

export interface ValuesPostgresql {
  audit: Audit
  common: PostgresqlCommon
  commonAnnotations: LivingstoneSouthernWhiteFacedOwl
  containerSecurityContext: ContainerSecurityContextClass
  customLivenessProbe: LivingstoneSouthernWhiteFacedOwl
  customReadinessProbe: LivingstoneSouthernWhiteFacedOwl
  customStartupProbe: LivingstoneSouthernWhiteFacedOwl
  enabled: boolean
  existingSecret: null
  extraDeploy: any[]
  extraEnv: any[]
  global: PostgresqlGlobal
  image: Image
  ldap: PostgresqlLDAP
  livenessProbe: Probe
  metrics: PostgresqlMetrics
  networkPolicy: PostgresqlNetworkPolicy
  persistence: PostgresqlPersistence
  postgresqlDataDir: string
  postgresqlDatabase: string
  postgresqlDbUserConnectionLimit: null
  postgresqlMaxConnections: null
  postgresqlPghbaRemoveFilters: null
  postgresqlPostgresConnectionLimit: null
  postgresqlSharedPreloadLibraries: string
  postgresqlStatementTimeout: null
  postgresqlTcpKeepalivesCount: null
  postgresqlTcpKeepalivesIdle: null
  postgresqlTcpKeepalivesInterval: null
  postgresqlUsername: string
  primary: Primary
  primaryAsStandBy: NetworkPolicies
  psp: PspClass
  rbac: PspClass
  readReplicas: Primary
  readinessProbe: Probe
  replication: Replication
  resources: PostgresqlResources
  securityContext: PodSecurityContextClass
  service: PostgresqlService
  serviceAccount: NetworkPolicies
  shmVolume: ShmVolume
  startupProbe: Probe
  tls: PostgresqlTLS
  updateStrategy: UpdateStrategy
  volumePermissions: VolumePermissions
}

export interface Audit {
  clientMinMessages: string
  logConnections: boolean
  logDisconnections: boolean
  logHostname: boolean
  logLinePrefix: string
  logTimezone: string
  pgAuditLog: string
  pgAuditLogCatalog: string
}

export interface PostgresqlCommon {
  exampleValue: string
  global: PostgresqlGlobal
}

export interface PostgresqlGlobal {
  postgresql: LivingstoneSouthernWhiteFacedOwl
}

export interface PostgresqlLDAP {
  baseDN: string
  bindDN: string
  enabled: boolean
  port: string
  prefix: string
  scheme: string
  search_attr: string
  search_filter: string
  server: string
  suffix: string
  tls: LivingstoneSouthernWhiteFacedOwl
  url: string
}

export interface Probe {
  enabled: boolean
  failureThreshold: number
  initialDelaySeconds: number
  periodSeconds: number
  successThreshold: number
  timeoutSeconds: number
}

export interface PostgresqlMetrics {
  enabled: boolean
  extraEnvVars: LivingstoneSouthernWhiteFacedOwl
  image: Image
  livenessProbe: Probe
  prometheusRule: PrometheusRule
  readinessProbe: Probe
  securityContext: ContainerSecurityContextClass
  service: PurpleService
  serviceMonitor: PurpleServiceMonitor
}

export interface PrometheusRule {
  additionalLabels: LivingstoneSouthernWhiteFacedOwl
  enabled: boolean
  namespace: string
  rules: any[]
}

export interface PurpleService {
  annotations: PodAnnotationsClass
  type: string
}

export interface PurpleServiceMonitor {
  additionalLabels: LivingstoneSouthernWhiteFacedOwl
  enabled: boolean
}

export interface PostgresqlNetworkPolicy {
  allowExternal: boolean
  enabled: boolean
  explicitNamespacesSelector: LivingstoneSouthernWhiteFacedOwl
}

export interface PostgresqlPersistence {
  accessModes: string[]
  annotations: LivingstoneSouthernWhiteFacedOwl
  enabled: boolean
  mountPath: string
  selector: LivingstoneSouthernWhiteFacedOwl
  size: string
  subPath: string
}

export interface Primary {
  affinity: LivingstoneSouthernWhiteFacedOwl
  annotations: LivingstoneSouthernWhiteFacedOwl
  extraInitContainers: any[]
  extraVolumeMounts: any[]
  extraVolumes: any[]
  labels: LivingstoneSouthernWhiteFacedOwl
  nodeAffinityPreset: NodeAffinityPreset
  nodeSelector: LivingstoneSouthernWhiteFacedOwl
  podAffinityPreset: string
  podAnnotations: LivingstoneSouthernWhiteFacedOwl
  podAntiAffinityPreset: string
  podLabels: LivingstoneSouthernWhiteFacedOwl
  priorityClassName: string
  service: LivingstoneSouthernWhiteFacedOwl
  sidecars: any[]
  tolerations: any[]
  persistence?: NetworkPolicies
  resources?: LivingstoneSouthernWhiteFacedOwl
}

export interface PspClass {
  create: boolean
}

export interface Replication {
  applicationName: string
  enabled: boolean
  numSynchronousReplicas: number
  password: string
  readReplicas: number
  synchronousCommit: string
  user: string
}

export interface PostgresqlResources {
  requests: Requests
}

export interface Requests {
  cpu: string
  memory: string
}

export interface PostgresqlService {
  annotations: LivingstoneSouthernWhiteFacedOwl | null
  port: number
  type: string
  nodePort?: null
}

export interface ShmVolume {
  chmod: NetworkPolicies
  enabled: boolean
}

export interface PostgresqlTLS {
  certFilename: string
  certKeyFilename: string
  certificatesSecret: string
  enabled: boolean
  preferServerCiphers: boolean
}

export interface UpdateStrategy {
  type: string
}

export interface VolumePermissions {
  enabled: boolean
  image: Image
  securityContext: SecurityContext
  resources?: LivingstoneSouthernWhiteFacedOwl
}

export interface SecurityContext {
  runAsUser: number
}

export interface ValuesRedis {
  cluster: Cluster
  clusterDomain: string
  common: RedisCommon
  configmap: string
  containerSecurityContext: ContainerSecurityContextClass
  enabled: boolean
  existingSecret: null
  global: RedisGlobal
  image: Image
  master: Master
  metrics: RedisMetrics
  networkPolicy: RedisNetworkPolicy
  password: string
  persistence: LivingstoneSouthernWhiteFacedOwl
  podDisruptionBudget: PodDisruptionBudget
  podSecurityPolicy: PspClass
  rbac: RedisRbac
  redisPort: number
  securityContext: PodSecurityContextClass
  sentinel: Sentinel
  serviceAccount: PspClass
  slave: Master
  sysctlImage: SysctlImage
  tls: RedisTLS
  usePassword: boolean
  usePasswordFile: boolean
  volumePermissions: VolumePermissions
}

export interface Cluster {
  enabled: boolean
  slaveCount: number
}

export interface RedisCommon {
  exampleValue: string
  global: RedisGlobal
}

export interface RedisGlobal {
  redis: LivingstoneSouthernWhiteFacedOwl
}

export interface Master {
  affinity: LivingstoneSouthernWhiteFacedOwl
  command: string
  customLivenessProbe: LivingstoneSouthernWhiteFacedOwl
  customReadinessProbe: LivingstoneSouthernWhiteFacedOwl
  disableCommands: string[]
  extraEnvVars: any[]
  extraEnvVarsCM: any[]
  extraEnvVarsSecret: any[]
  extraFlags: any[]
  hostAliases: any[]
  livenessProbe: Probe
  persistence: MasterPersistence
  podAnnotations: LivingstoneSouthernWhiteFacedOwl
  podLabels: LivingstoneSouthernWhiteFacedOwl
  preExecCmds: string
  priorityClassName: LivingstoneSouthernWhiteFacedOwl
  readinessProbe: Probe
  service: MasterService
  shareProcessNamespace: boolean
  statefulset: Statefulset
  port?: number
  spreadConstraints?: LivingstoneSouthernWhiteFacedOwl
}

export interface MasterPersistence {
  accessModes: string[]
  enabled: boolean
  matchExpressions: LivingstoneSouthernWhiteFacedOwl
  matchLabels: LivingstoneSouthernWhiteFacedOwl
  path: string
  size: string
  subPath: string
}

export interface MasterService {
  annotations: LivingstoneSouthernWhiteFacedOwl
  externalTrafficPolicy: string
  labels: LivingstoneSouthernWhiteFacedOwl
  port?: number
  type: string
}

export interface Statefulset {
  annotations: LivingstoneSouthernWhiteFacedOwl
  labels: LivingstoneSouthernWhiteFacedOwl
  updateStrategy: string
  volumeClaimTemplates: VolumeClaimTemplates
}

export interface VolumeClaimTemplates {
  annotations: LivingstoneSouthernWhiteFacedOwl
  labels: LivingstoneSouthernWhiteFacedOwl
}

export interface RedisMetrics {
  enabled: boolean
  image: Image
  podAnnotations: PodAnnotationsClass
  priorityClassName: LivingstoneSouthernWhiteFacedOwl
  prometheusRule: PrometheusRule
  service: MasterService
  serviceMonitor: FluffyServiceMonitor
}

export interface FluffyServiceMonitor {
  enabled: boolean
  metricRelabelings: any[]
  relabelings: any[]
  selector: Selector
}

export interface Selector {
  prometheus: string
}

export interface RedisNetworkPolicy {
  enabled: boolean
  ingressNSMatchLabels: LivingstoneSouthernWhiteFacedOwl
  ingressNSPodMatchLabels: LivingstoneSouthernWhiteFacedOwl
}

export interface PodDisruptionBudget {
  enabled: boolean
  minAvailable: number
}

export interface RedisRbac {
  create: boolean
  role: Role
}

export interface Role {
  rules: any[]
}

export interface Sentinel {
  cleanDelaySeconds: number
  customLivenessProbe: LivingstoneSouthernWhiteFacedOwl
  customReadinessProbe: LivingstoneSouthernWhiteFacedOwl
  downAfterMilliseconds: number
  enabled: boolean
  extraEnvVars: any[]
  extraEnvVarsCM: any[]
  extraEnvVarsSecret: any[]
  failoverTimeout: number
  image: Image
  initialCheckTimeout: number
  livenessProbe: Probe
  masterSet: string
  parallelSyncs: number
  port: number
  preExecCmds: string
  quorum: number
  readinessProbe: Probe
  service: SentinelService
  staticID: boolean
  usePassword: boolean
}

export interface SentinelService {
  annotations: LivingstoneSouthernWhiteFacedOwl
  externalTrafficPolicy: string
  labels: LivingstoneSouthernWhiteFacedOwl
  redisPort: number
  sentinelPort: number
  type: string
}

export interface SysctlImage {
  command: any[]
  enabled: boolean
  mountHostSys: boolean
  pullPolicy: any
  registry: any
  repository: string
  resources: LivingstoneSouthernWhiteFacedOwl
  tag: string
}

export interface RedisTLS {
  authClients: boolean
  enabled: boolean
}

export interface Scheduler {
  args: null
  command: null
  customLivenessProbe: LivingstoneSouthernWhiteFacedOwl
  customReadinessProbe: LivingstoneSouthernWhiteFacedOwl
  extraEnvVars: null
  extraEnvVarsCM: null
  extraEnvVarsSecret: null
  extraVolumeMounts: null
  extraVolumes: null
  hostAliases: any[]
  image: Image
  initContainers: null
  nodeSelector: LivingstoneSouthernWhiteFacedOwl
  podAnnotations: LivingstoneSouthernWhiteFacedOwl | null
  podDisruptionBudget: PodDisruptionBudget
  podLabels: null
  priorityClassName: string
  replicaCount: number
  resources: SchedulerResources
  sidecars: null
  baseUrl?: null
  configMap?: null
  containerPort?: number
  livenessProbe?: Probe
  readinessProbe?: Probe
  autoscaling?: Autoscaling
  podManagementPolicy?: null
  podTemplate?: null
  port?: number
  rollingUpdatePartition?: null
  updateStrategy?: string
}

export interface Autoscaling {
  enabled: boolean
  replicas: Replicas
  targets: Targets
}

export interface Replicas {
  max: number
  min: number
}

export interface Targets {
  cpu: number
  memory: number
}

export interface SchedulerResources {
  limits: LivingstoneSouthernWhiteFacedOwl
  requests: LivingstoneSouthernWhiteFacedOwl
}

export interface ServiceAccount {
  annotations: LivingstoneSouthernWhiteFacedOwl
  create: boolean
}

export interface Config {
  affinity: LivingstoneSouthernWhiteFacedOwl
  auth: Auth
  commonAnnotations: LivingstoneSouthernWhiteFacedOwl
  commonLabels: LivingstoneSouthernWhiteFacedOwl
  configurationConfigMap: null
  containerSecurityContext: ContainerSecurityContextClass
  dagsConfigMap: null
  executor: string
  externalDatabase: ExternalDatabase
  externalRedis: ExternalRedis
  extraDeploy: any[]
  extraEnvVars: any[]
  extraEnvVarsCM: null
  extraEnvVarsSecret: null
  fullnameOverride: null
  git: Git
  ingress: Ingress
  initContainers: null
  kubeVersion: null
  ldap: ValuesLDAP
  loadExamples: boolean
  metrics: ValuesMetrics
  nameOverride: null
  networkPolicies: NetworkPolicies
  nodeAffinityPreset: NodeAffinityPreset
  nodeSelector: LivingstoneSouthernWhiteFacedOwl
  podAffinityPreset: string
  podAntiAffinityPreset: string
  podSecurityContext: PodSecurityContextClass
  postgresql: ConfigPostgresql
  rbac: PspClass
  redis: ConfigRedis
  scheduler: Scheduler
  service: PostgresqlService
  serviceAccount: ServiceAccount
  sidecars: null
  tolerations: any[]
  web: Scheduler
  worker: Scheduler
}

export interface ConfigPostgresql {
  enabled: boolean
  existingSecret: null
  postgresqlDatabase: string
  postgresqlUsername: string
}

export interface ConfigRedis {
  cluster: NetworkPolicies
  enabled: boolean
  existingSecret: null
}

export interface Info {
  first_deployed: string
  last_deployed: string
  deleted: string
  description: string
  status: string
  notes: string
}
