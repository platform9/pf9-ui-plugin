import openstack from './openstack'
import metalstack from './metalstack'
import kubernetes from './kubernetes'
import developer from './developer'
import account from './account'
import theme from './theme'

const devEnabled = window.localStorage.enableDevPlugin === 'true'

const plugins = [
  // Order here is important as it will define the default Dashboard route
  // for fallback routes (when trying to reach the base url)
  kubernetes,
  openstack,
  metalstack,
  account,
  theme,
  ...(devEnabled ? [developer] : []),
]

export default plugins
