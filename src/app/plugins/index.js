import openstack from './openstack'
import kubernetes from './kubernetes'
import developer from './developer'
import theme from './theme'

const devEnabled = window.localStorage.enableDevPlugin === 'true'

const plugins = [
  openstack,
  kubernetes,
  theme,
  ...(devEnabled ? [developer] : []),
]

export default plugins
