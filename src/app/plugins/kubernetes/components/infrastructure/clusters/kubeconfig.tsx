import ApiClient from 'api-client/ApiClient'

type AuthMethod = 'token' | 'password'
interface UserCreds { username: string, password: string }

interface KubeConfigError { error: string }
interface KubeConfigSuccess { kubeconfig: string }
type KubeConfigResponse = KubeConfigError | KubeConfigSuccess

const { keystone } = ApiClient.getInstance()

const tokenAuth = () => keystone.renewScopedToken()

const passwordAuth = async (username, password) => {
  if (username && password) {
    const authResult = await keystone.authenticate(username, password)
    if (authResult.unscopedToken) {
      return btoa(JSON.stringify({ username, password }))
    }
  }
  return null
}

// Qbert returns a kubeconfig template.  The UI then needs to populate the 'user.token' field with
// either the session token, or a base64 encoded JSON string with their username / password.
const getKubeConfigTemplate = async (clusterUuid: string): Promise<string> => {
  const kubeconfig = await ApiClient.getInstance().qbert.getKubeConfig(clusterUuid)
  return kubeconfig
}

export const generateKubeConfig = async (
  clusterUuid: string,
  authMethod: AuthMethod,
  userCreds?: UserCreds,
): Promise<KubeConfigResponse> => {
  try {
    const token = authMethod === 'token'
    ? await tokenAuth()
    : await passwordAuth(userCreds.username, userCreds.password)

    if (!token) return { error: 'Invalid Credentials' }

    const template = await getKubeConfigTemplate(clusterUuid)
    return { kubeconfig: template.replace('__INSERT_BEARER_TOKEN_HERE__', token) }
  } catch (e) {
    const error = e.message || 'An error occured while trying to download the kubeconfig.'
    return { error }
  }
}
