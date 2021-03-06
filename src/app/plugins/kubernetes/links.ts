import { pf9DocOrigin } from 'app/constants'

// Documentation links
const k8sBaseUrl = `${pf9DocOrigin}/kubernetes`
const microsoftDocBaseUrl = 'https://docs.microsoft.com/en-us'
const amazonDocBaseUrl = 'http://docs.aws.amazon.com'
const pf9GitHubRepoUrl = 'https://raw.githubusercontent.com/platform9'
export const pf9SupportBaseUrl = 'https://support.platform9.com'
const communityBaseUrl = 'https://community.platform9.com'
const k8sDocBaselUrl = 'https://kubernetes.io/docs'
const dockerDocBaseUrl = 'https://docs.docker.com'

// MFA
export const MFAHelpLink = `${pf9DocOrigin}/openstack/authentication/enable_mfa_for_user/`

// Qbert
export const qbertApiLink = `${pf9DocOrigin}/qbert/ref`

// Help
export const gettingStartedHelpLink = `${k8sBaseUrl}/quickstart/`
export const tutorialsHelpLink = `${k8sBaseUrl}/tutorials-kubernetes-on-macos`
export const slackLink = 'https://slack.platform9.io'
export const forumHelpLink = `${communityBaseUrl}/`
export const pf9PmkArchitectureDigLink = `${k8sBaseUrl}/multimaster-architecture-platform9-managed-kubernetes/`
export const pmkDocumentationLink = `${k8sBaseUrl}/introduction/overview`
export const requestFormLink = `${pf9SupportBaseUrl}/hc/en-us/requests/new?ticket_form_id=360000924873`

// Aws
export const awsPrerequisitesLink = `${k8sBaseUrl}/aws-prerequisites`
export const awsNetworkingConfigurationsLink = `${k8sBaseUrl}/networking/configurations-supported-aws-cloud-provider/`
export const awsAccessHelpLink = `${amazonDocBaseUrl}/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys`
export const iamPolicyLink = `${pf9GitHubRepoUrl}/support-locker/master/pmk/aws-policy.json`
export const awsRoute53HelpLink = `${amazonDocBaseUrl}/Route53/latest/DeveloperGuide/dns-configuring-new-domain.html`
export const eksHelpLink = `${k8sBaseUrl}/eks-cluster-management`

// Azure
export const azurePrerequisitesLink = `${k8sBaseUrl}/azure-prerequisites`
export const azureServicePrincipalPortalLink = `${microsoftDocBaseUrl}/azure/active-directory/develop/howto-create-service-principal-portal`
export const azureGetValuesForSigninginLink = `${microsoftDocBaseUrl}/azure/active-directory/develop/howto-create-service-principal-portal#get-values-for-signing-in`
export const azureCreateANewApplicationSecretLink = `${microsoftDocBaseUrl}/azure/active-directory/develop/howto-create-service-principal-portal#create-a-new-application-secret`

// Google
export const googlePrerequisitesLink = `${k8sBaseUrl}/google-cloud-prerequisites`

// BareOS
export const gettingStartedLink = `${k8sBaseUrl}/quickstart/`
export const whatIsBareOSLink = `${k8sBaseUrl}/on-premise-kubernetes/what-is-bareos`
export const bareOSSetupDocumentationLink = `${k8sBaseUrl}/create-multimaster-bareos-cluster/`
export const bareOSSingleMasterSetupDocsLink = `${k8sBaseUrl}/bareos-create-singlemaster-multinode-cluster/`
// Clusters
export const remoteMonitoringDocsLink = `${k8sBaseUrl}/enable-remote-monitoring/`
export const kubectlInstallationDocumentationLink = `${pf9DocOrigin}/kubernetes/kubectl/`

// Nodes
export const nodeInstallTroubleshooting = `${k8sBaseUrl}/troubleshooting/node-install-status-check/`
export const nodePrerequisitesDocumentationLink = `${k8sBaseUrl}/on-premise-kubernetes-pre-requisites#setting-up-the-platform9-free-tier-cluster`
export const ovaDocumentationLink = `${k8sBaseUrl}/pmk-vm-ova`

// CLI
export const pmkCliOverviewLink = `${k8sBaseUrl}/PMK-CLI/`
export const pmkCliPrepNodeLink = `${k8sBaseUrl}/PMK-CLI/prep-node/`
export const pmkCliCreateLink = `${k8sBaseUrl}/PMK-CLI/create/`

// Pods
export const createPodLink = `${k8sDocBaselUrl}/tasks/configure-pod-container/communicate-containers-same-pod/#creating-a-pod-that-runs-two-containers`

// Deployments
export const createDeploymentLink = `${k8sDocBaselUrl}/concepts/workloads/controllers/deployment/#creating-a-deployment`

// Services
export const createServiceLink = `${k8sDocBaselUrl}/tutorials/connecting-apps/connecting-frontend-backend/#creating-the-backend-service-object`

// Storage
export const persistVolumesStorageClassesLink = `${k8sDocBaselUrl}/concepts/storage/persistent-volumes/#storageclasses`

// Api Access
export const kubeconfigFileLink = `${k8sBaseUrl}/kubeconfig-and-clients-introduction-to-kubeconfig`
export const kubectlOverviewLink = `${k8sDocBaselUrl}/user-guide/kubectl-overview/`
export const konformGithubLink = `${pf9GitHubRepoUrl}/konform`

// Misc
export const runtimePrivilegedLink = `${dockerDocBaseUrl}/engine/reference/run/#runtime-privilege-and-linux-capabilities`
export const applicationLoadBalancer = `${k8sBaseUrl}/pmk-load-balancing-with-metallb/`
