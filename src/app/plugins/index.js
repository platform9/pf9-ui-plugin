import openstack from './openstack'
import kubernetes from './kubernetes'
import developer from './developer'

const devEnabled = window.localStorage.enableDevPlugin === 'true'

const plugins = [
  openstack,
  kubernetes,
  ...(devEnabled ? [developer] : []),
]

export default plugins
