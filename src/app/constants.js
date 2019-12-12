// App
export const defaultUniqueIdentifier = 'id'
export const appUrlRoot = '/ui'
export const imageUrlRoot = `${appUrlRoot}/images`
export const helpUrl = `${appUrlRoot}/help`
export const loginUrl = `${appUrlRoot}/login`
export const loginWithCookieUrl = `${appUrlRoot}/pmkft/login`
export const resetPasswordUrl = `${appUrlRoot}/reset/password`
export const resetPasswordThroughEmailUrl = '/reset/password'
export const forgotPasswordUrl = `${appUrlRoot}/forgot_password`
export const logoutUrl = `${appUrlRoot}/logout`
export const resetPasswordApiUrl = '/clemency/reset/password'
export const forgotPasswordApiUrl = '/clemency/request'
export const dashboardUrl = `${appUrlRoot}/kubernetes/`
export const allKey = '__all__'
export const noneKey = '__none__'
export const listTablePrefs = ['visibleColumns', 'columnsOrder', 'rowsPerPage', 'orderBy', 'orderDirection']
export const uuidRegex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/, 'i')

export const k8sPrefix = `${appUrlRoot}/kubernetes`

// Documentation links
export const qbertApiLink = 'https://docs.platform9.com/kubernetes/Qbert-API-Reference'
export const whatIsBareOSLink = 'https://docs.platform9.com/kubernetes/on-premise-kubernetes/what-is-bareos'

// Errors
export const addError = 'ERR_ADD'
export const updateError = 'ERR_UPDATE'
export const deleteError = 'ERR_DELETE'
export const notFoundErr = 'ERR_NOT_FOUND'

// Clarity
export const clarityUrlRoot = '/clarity/index.html#'
export const clarityDashboardUrl = `${clarityUrlRoot}/dashboard`

export const imageUrls = Object.freeze({
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
