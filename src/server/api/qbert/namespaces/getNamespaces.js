import context from '../../../context'
import Namespace from '../../../models/qbert/Namespace'

const getNamespaces = (req, res) => {
  const namespaces = Namespace.list(context)
  const response = {
    apiVersion: 'v1',
    items: namespaces,
    kind: 'NamespaceList',
    metadata: {
      resourceVersion: '5201088',
      selfLink: '/api/v1/namespaces'
    }
  }
  return res.send(response)
}

export default getNamespaces
