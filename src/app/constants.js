// App
export const appUrlRoot = '/ui'
export const imageUrlRoot = `${appUrlRoot}/images`
export const loginUrl = `${appUrlRoot}/openstack/login`
export const logoutUrl = `${appUrlRoot}/openstack/logout`
export const dashboardUrl = `${appUrlRoot}/kubernetes/`
export const allKey = '__all__'

// Errors
export const notFoundErr = 'ERR_NOT_FOUND'

// Clarity
export const clarityUrlRoot = '/clarity/index.html#'
export const clarityDashboardUrl = `${clarityUrlRoot}/dashboard`

export const imageUrls = Object.freeze({
  logo: `${imageUrlRoot}/logo.png`,
  loading: `${imageUrlRoot}/loading.gif`,
  kubernetes: `${imageUrlRoot}/logo-kubernetes-h.png`
})
