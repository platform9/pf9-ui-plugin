import React from 'react'
import { compose } from 'ramda'
import { withAppContext } from 'core/AppContext'

class DownloadKubeConfigLink extends React.Component {
  handleClick = e => {
    // Prevent the table row from being selected
    e.preventDefault()
    e.stopPropagation()

    console.log('DownloadKubeConfigLink#handleClick')
    // TODO: The original solution involves requesting the user
    // for their username and password and then saving them
    // in the "context" for future use.  I'm not crazy about the
    // security implications.  I'd like to punt on this for now
    // and see if we can get a dedicated endpoint that uses the
    // existing auth headers to authenticate.
  }

  render () {
    return (
      <a href="#" onClick={this.handleClick}>kubeconfig</a>
    )
  }
}

export default compose(
  withAppContext,
)(DownloadKubeConfigLink)
