import React from 'react'
import { compose } from 'ramda'
import { withAppContext } from 'core/AppContext'
import SimpleLink from 'core/common/SimpleLink'

class DownloadKubeConfigLink extends React.Component {
  handleClick = e => {
    console.log('DownloadKubeConfigLink#handleClick')
    // TODO: The original solution involves requesting the user
    // for their username and password and then saving them
    // in the "context" for future use.  I'm not crazy about the
    // security implications.  I'd like to punt on this for now
    // and see if we can get a dedicated endpoint that uses the
    // existing auth headers to authenticate.
    //
    // After further discussions with the Qbert team there will
    // be some refactoring done to support self-service users.
    // It is likely we can re-use that logic instead when it
    // becomes available.
  }

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
