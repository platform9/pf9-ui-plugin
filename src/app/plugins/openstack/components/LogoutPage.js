import React from 'react'
import { compose } from 'core/fp'
import { withRouter } from 'react-router'
import { withAppContext } from 'core/AppContext'

import { clear } from 'core/common/pf9-storage'

// We are abusing the React component system a little bit here.  This is really
// nothing but an action but I didn't want to clutter the Navbar component with
// more code.  This gives us a nice clean separation.
export class LogoutPage extends React.Component {
  componentDidMount () {
    const { history, destroySession } = this.props
    clear('username')
    clear('unscopedToken')
    destroySession()
    history.push('/ui/openstack/login')
  }

  render = () => null
}

export default compose(
  withRouter,
  withAppContext,
)(LogoutPage)
