import React from 'react'
import { compose } from 'ramda'
import { withAppContext } from 'core/AppProvider'
import SimpleLink from 'core/components/SimpleLink'

class DownloadKubeConfigLink extends React.Component {
  handleClick = async () => {
    const { cluster, context } = this.props
    const _kubeConfig = await context.apiClient.qbert.getKubeConfig(cluster.uuid)
    const newToken = await context.apiClient.keystone.renewScopedToken()
    const kubeConfig = _kubeConfig.replace('__INSERT_BEARER_TOKEN_HERE__', newToken)

    const blob = new Blob([kubeConfig], { type: 'application/octet-stream' })
    let elem = window.document.createElement('a')
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

export default compose(
  withAppContext,
)(DownloadKubeConfigLink)
