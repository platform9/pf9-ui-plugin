// App
export const defaultUniqueIdentifier = 'id'
export const appUrlRoot = '/ui'
export const imageUrlRoot = `${appUrlRoot}/images`
export const helpUrl = `${appUrlRoot}/help`
export const loginUrl = `${appUrlRoot}/login`
export const loginWithCookieUrl = `${appUrlRoot}/pmkft/login`
export const loginWithSsoUrl = `${appUrlRoot}/ssologin`
export const resetPasswordThroughEmailUrl = '/reset/password'
export const resetPasswordUrl = `${appUrlRoot}${resetPasswordThroughEmailUrl}`
export const forgotPasswordUrl = `${appUrlRoot}/forgot_password`
export const activateUserUrl = `${appUrlRoot}/users/activate`
export const logoutUrl = `${appUrlRoot}/logout`
export const resetPasswordApiUrl = '/clemency/reset/password'
export const forgotPasswordApiUrl = '/clemency/request'
export const dashboardUrl = `${appUrlRoot}/kubernetes/`
export const ironicWizardUrl = `${appUrlRoot}/metalstack/setup`
export const allKey = '__all__'
export const noneKey = '__none__'
export const listTablePrefs = [
  'visibleColumns',
  'columnsOrder',
  'rowsPerPage',
  'orderBy',
  'orderDirection',
]
export const uuidRegex = new RegExp(
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  'i',
)
export const originUsernameRegex = new RegExp(/:\/\/(?<originUsername>(.+?)).platform9./, 'i')

export const k8sPrefix = `${appUrlRoot}/kubernetes`
export const userAccountPrefix = `${appUrlRoot}/my-account`
export const pluginRoutePrefix = `${appUrlRoot}/:plugin`

export enum AppPlugins {
  MyAccount = 'my-account',
  Kubernetes = 'kubernetes',
  OpenStack = 'openstack',
  BareMetal = 'metalstack',
}
export const appPlugins = [
  AppPlugins.MyAccount,
  AppPlugins.BareMetal,
  AppPlugins.Kubernetes,
  AppPlugins.OpenStack,
]

export enum CustomerTiers {
  Enterprise = 'enterprise',
  Freedom = 'freedom',
  Growth = 'growth',
  OEM = 'oem',
}

export const ssoEnabledTiers = [CustomerTiers.Enterprise, CustomerTiers.OEM]
export const themeEnabledTiers = [CustomerTiers.Enterprise, CustomerTiers.OEM]

export enum ClusterCloudPlatforms {
  EKS = 'eks',
  AKS = 'aks',
  GKE = 'gke',
}

export const defaultGroupMappingId = 'idp1_mapping'

export const upgradeLinks = {
  [CustomerTiers.Freedom]: 'https://platform9.com/signup/growth/',
  [CustomerTiers.Growth]: 'https://platform9.com/pricing/request/',
}

export const onboardingAccessSetup = 'onboarding/api-access'
export const onboardingMonitoringSetup = 'onboarding/monitoring-enabled'
export const onboardingPodSetup = 'onboarding/pod-setup'

export const defaultEtcBackupPath = '/etc/pf9/etcd-backup'

// Errors
export const addError = 'ERR_ADD'
export const updateError = 'ERR_UPDATE'
export const deleteError = 'ERR_DELETE'
export const notFoundErr = 'ERR_NOT_FOUND'

// Documentation
export const pf9DocOrigin = 'https://docs.platform9.com'

// Clarity
export const clarityUrlRoot = '/clarity/index.html#'
export const clarityDashboardUrl = `${clarityUrlRoot}/dashboard`

export const imageUrls = Object.freeze({
  logoPrimary: `${imageUrlRoot}/primary-logo.png`,
  logoBlue: `${imageUrlRoot}/logo-color.png`,
  logo: `${imageUrlRoot}/logo.png`,
  // loading: `${imageUrlRoot}/loading.gif`,
  loadingBluePinkTiles: `${imageUrlRoot}/loading-blue-pink-tiles.svg`,
  loadingBlueTiles: `${imageUrlRoot}/loading-blue-tiles.svg`,
  loadingEllipsis: `${imageUrlRoot}/loading-ellipsis.svg`,
  kubernetes: `${imageUrlRoot}/logo-kubernetes-h.png`,
})

export const LoadingGifs = {
  BlueTiles: 'loadingBlueTiles',
  BluePinkTiles: 'loadingBluePinkTiles',
  Ellipsis: 'loadingEllipsis',
}

// k8s
export const defaultMonitoringTag = Object.freeze({
  key: 'pf9-system:monitoring',
  value: 'true',
})

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

// Misc
export const publicSlackLink = 'https://kplane.slack.com'
export const supportEmail = 'support-ft@platform9.com'
export const pmkftSignupLink = 'https://platform9.com/signup-flow/?sandbox=kubernetes'

export enum UserPreferences {
  Aws = 'aws',
  Azure = 'azure',
  FeatureFlags = 'featureFlags',
}

export enum GlobalPreferences {
  Theme = 'theme',
}
