// App
export const defaultUniqueIdentifier = 'id'
export const appUrlRoot = '/ui'
export const imageUrlRoot = `${appUrlRoot}/images`
export const helpUrl = `${appUrlRoot}/help`
export const loginUrl = `${appUrlRoot}/login`
export const loginWithCookieUrl = `${appUrlRoot}/pmkft/login`
export const resetPasswordUrl = `${appUrlRoot}/reset/password/:id`
export const resetPasswordThroughEmailUrl = '/reset/password'
export const forgotPasswordUrl = `${appUrlRoot}/forgot_password`
export const activateUserUrl = `${appUrlRoot}/users/activate`
export const logoutUrl = `${appUrlRoot}/logout`
export const resetPasswordApiUrl = '/clemency/reset/password'
export const forgotPasswordApiUrl = '/clemency/request'
export const dashboardUrl = `${appUrlRoot}/kubernetes/`
export const ironicWizardUrl = `${appUrlRoot}/openstack/ironic/setup`
export const allKey = '__all__'
export const noneKey = '__none__'
export const listTablePrefs = ['visibleColumns', 'columnsOrder', 'rowsPerPage', 'orderBy', 'orderDirection']
export const uuidRegex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/, 'i')

export const k8sPrefix = `${appUrlRoot}/kubernetes`

export const OnboardingAccessSetup = 'onboarding/api-access'
export const OnboardingMonitoringSetup = 'onboarding/monitoring-enabled'
export const OnboardingPodSetup = 'onboarding/pod-setup'

export const defaultEtcBackupPath = '/etc/pf9/etcd-backup'

// Documentation links
export const gettingStartedLink = 'https://docs.platform9.com/kubernetes/getting-started/bare-metal-preinstall-checklist/'
export const qbertApiLink = 'https://docs.platform9.com/kubernetes/Qbert-API-Reference'
export const whatIsBareOSLink = 'https://docs.platform9.com/kubernetes/on-premise-kubernetes/what-is-bareos'
export const BareOSSetupDocumentation = 'https://docs.platform9.com/kubernetes/create-multimaster-bareos-cluster/'
export const remoteMonitoringDocs = 'https://docs.platform9.com/kubernetes/enable-remote-monitoring/'
export const managedContainerChecklist = 'https://docs.platform9.com/getting-started/managed-container-cloud-requirements-checklist'
export const pmkCliOverview = 'https://docs.platform9.com/kubernetes/PMK-CLI/overview/'
export const pmkCliCreate = 'https://docs.platform9.com/kubernetes/PMK-CLI/create/'

export const runtimePrivileged = 'https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities'
export const awsNetworkingConfigurations = 'https://docs.platform9.com/kubernetes/networking/configurations-supported-aws-cloud-provider/'

export const awsAccessHelpUrl = 'http://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys'
export const iamPolicy = 'https://github.com/platform9/support-locker/blob/master/pmk/aws-policy.json'

export const azureServicePrincipalPortal = 'https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal'
export const azureGetValuesForSigningin = 'https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal#get-values-for-signing-in'
export const azureCreateANewApplicationSecret = 'https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal#create-a-new-application-secret'

export const createPodUrl = 'https://kubernetes.io/docs/tasks/configure-pod-container/communicate-containers-same-pod/#creating-a-pod-that-runs-two-containers'
export const createDeploymentUrl = 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#creating-a-deployment'
export const createServiceUrl = 'https://kubernetes.io/docs/tutorials/connecting-apps/connecting-frontend-backend/#creating-the-backend-service-object'

// Errors
export const addError = 'ERR_ADD'
export const updateError = 'ERR_UPDATE'
export const deleteError = 'ERR_DELETE'
export const notFoundErr = 'ERR_NOT_FOUND'

// Clarity
export const clarityUrlRoot = '/clarity/index.html#'
export const clarityDashboardUrl = `${clarityUrlRoot}/dashboard`

export const imageUrls = Object.freeze({
  logoBlue: `${imageUrlRoot}/logo-color.png`,
  logo: `${imageUrlRoot}/logo.png`,
  loading: `${imageUrlRoot}/loading.gif`,
  kubernetes: `${imageUrlRoot}/logo-kubernetes-h.png`,
})

// k8s
export const codeMirrorOptions = Object.freeze({
  mode: 'yaml',
})

/**
 * Default axios config
 * @type {object}
 */
export const defaultAxiosConfig = Object.freeze({
  // While headers here will apply for all requests, is important to remember that
  // some services like Openstack will require custom headers for specific methods
  // like "Content-Type": "application/json-patch+json" for PATCH
  headers: {
    common: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
  },
  timeout: 120000,
})
