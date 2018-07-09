import React from 'react'
import Session from '../actions/session'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { withRouter } from 'react-router'

const mapStateToProps = () => ({})

// We are abusing the React component system a little bit here.  This is really
// nothing but an action but I didn't want to clutter the Navbar component with
// more code.  This gives us a nice clean separation.
export class LogoutPage extends React.Component {
  componentDidMount () {
    const { dispatch, history } = this.props
    const session = new Session()
    dispatch(session.signOut())
    history.push('/ui/openstack/login')
  }

  render = () => null
}

export default compose(
  withRouter,
  connect(mapStateToProps),
)(LogoutPage)
