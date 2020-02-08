import { pf9DocOrigin } from 'app/constants'

// Documentation links
const k8sBaseUrl = `${pf9DocOrigin}/kubernetes`
const microsoftDocBaseUrl = 'https://docs.microsoft.com/en-us'
const amazonDocBaseUrl = 'http://docs.aws.amazon.com'
const pf9GitHubRepoUrl = 'https://github.com/platform9'
const pf9SupportBaseUrl = 'https://support.platform9.com'
const k8sDocBaselUrl = 'https://kubernetes.io/docs'
const dockerDocBaseUrl = 'https://docs.docker.com'
// Qbert
export const qbertApiLink = `${k8sBaseUrl}/API-Reference/Qbert-API-Reference/`

// Help
export const gettingStartedHelpLink = `${k8sBaseUrl}/qucickstart/`
export const tutorialsHelpLink = `${k8sBaseUrl}/tutorials/virtualbox-mac/`
export const slackLink = 'https://kplane.slack.com/'
export const emailSupportLink = 'mailto:support-ft@platform9.com'
export const forumHelpLink = `${pf9SupportBaseUrl}/hc/en-us/community/topics`
export const pf9PmkArchitectureDigLink = `${pf9DocOrigin}/support/ha-for-baremetal-multimaster-kubernetes-cluster-service-type-load-balancer/`
export const pmkDocumentationLink = `${k8sBaseUrl}/introduction/overview`

// Aws
export const awsPrerequisitesLink = `${k8sBaseUrl}/aws/`
export const awsNetworkingConfigurationsLink = `${k8sBaseUrl}/networking/configurations-supported-aws-cloud-provider/`
export const awsAccessHelpLink = `${amazonDocBaseUrl}/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys`
export const iamPolicyLink = `${pf9GitHubRepoUrl}/support-locker/blob/master/pmk/aws-policy.json`

// Azure
export const azurePrerequisitesLink = `${k8sBaseUrl}/azure/`
export const azureServicePrincipalPortalLink = `${microsoftDocBaseUrl}/azure/active-directory/develop/howto-create-service-principal-portal`
export const azureGetValuesForSigninginLink = `${microsoftDocBaseUrl}/azure/active-directory/develop/howto-create-service-principal-portal#get-values-for-signing-in`
export const azureCreateANewApplicationSecretLink = `${microsoftDocBaseUrl}/azure/active-directory/develop/howto-create-service-principal-portal#create-a-new-application-secret`

// BareOS
export const gettingStartedLink = `${k8sBaseUrl}/getting-started/bare-metal-preinstall-checklist/`

export const whatIsBareOSLink = `${k8sBaseUrl}/on-premise-kubernetes/what-is-bareos`
export const bareOSSetupDocumentationLink = `${k8sBaseUrl}/create-multimaster-bareos-cluster/`
export const remoteMonitoringDocsLink = `${k8sBaseUrl}/enable-remote-monitoring/`
export const managedContainerChecklistLink = `${pf9DocOrigin}/getting-started/managed-container-cloud-requirements-checklist`

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
export const kubeconfigFileLink = `${k8sBaseUrl}/kubeconfig-and-clients/introduction-to-kubeconfig/`
export const kubectlOverviewLink = `${k8sDocBaselUrl}/user-guide/kubectl-overview/`

// Misc
export const runtimePrivilegedLink = `${dockerDocBaseUrl}/engine/reference/run/#runtime-privilege-and-linux-capabilities`
