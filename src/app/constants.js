// App
export const defaultUniqueIdentifier = 'id'
export const appUrlRoot = '/ui'
export const imageUrlRoot = `${appUrlRoot}/images`
export const loginUrl = `${appUrlRoot}/openstack/login`
export const resetPasswordUrl = `${appUrlRoot}/openstack/reset_password`
export const resetPasswordApiUrl = '/clemency/reset/password/'
export const forgotPasswordUrl = `${appUrlRoot}/openstack/forgot_password`
export const forgotPasswordApiUrl = '/clemency/request'
export const logoutUrl = `${appUrlRoot}/openstack/logout`
export const dashboardUrl = `${appUrlRoot}/kubernetes/`
export const allKey = '__all__'
export const noneKey = '__none__'
export const listTablePrefs = ['visibleColumns', 'columnsOrder', 'rowsPerPage', 'orderBy', 'orderDirection']
export const uuidRegex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/, 'i')

export const k8sPrefix = `${appUrlRoot}/kubernetes`

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
  timeout: 120000,
})
