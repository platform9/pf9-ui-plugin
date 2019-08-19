import React from 'react'
import { withRouter } from 'react-router'
import { compose } from 'app/utils/fp'
import { withAppContext } from 'core/AppProvider'
import { clear } from 'core/utils/pf9Storage'
import { loginUrl } from 'app/constants'

// We are abusing the React component system a little bit here.  This is really
// nothing but an action but I didn't want to clutter the Navbar component with
// more code.  This gives us a nice clean separation.
export class LogoutPage extends React.Component {
  componentDidMount () {
    const { history, destroySession } = this.props
    clear('user')
    clear('tokens')
    destroySession()
    history.push(loginUrl)
  }

  render = () => null
}

export default compose(
  withRouter,
  withAppContext,
)(LogoutPage)
