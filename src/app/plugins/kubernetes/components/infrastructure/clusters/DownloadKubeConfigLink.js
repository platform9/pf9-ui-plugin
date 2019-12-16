import React from 'react'
import ApiClient from 'api-client/ApiClient'
import SimpleLink from 'core/components/SimpleLink'

class DownloadKubeConfigLink extends React.PureComponent {
  handleClick = async () => {
    const { cluster } = this.props
    const { qbert, keystone } = ApiClient.getInstance()
    const _kubeConfig = await qbert.getKubeConfig(cluster.uuid)
    const newToken = await keystone.renewScopedToken()
    const kubeConfig = _kubeConfig.replace('__INSERT_BEARER_TOKEN_HERE__', newToken)

    const blob = new Blob([kubeConfig], { type: 'application/octet-stream' })
    const elem = window.document.createElement('a')
    elem.href = window.URL.createObjectURL(blob)
    elem.download = `${cluster.name}.yml`
    document.body.appendChild(elem)
    elem.click()
    document.body.removeChild(elem)
  }

  // How to explain to user that the kubeconfig will only be valid for 24h?

  render () {
    return (
      <div>
        <SimpleLink onClick={this.handleClick}>kubeconfig</SimpleLink>
      </div>
    )
  }
}

export default DownloadKubeConfigLink
