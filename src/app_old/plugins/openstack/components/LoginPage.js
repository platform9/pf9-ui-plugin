import React from 'react'
import { connect } from 'react-redux'
import Button from 'material-ui/Button'
import Session from '../actions/session'
import { withRouter } from 'react-router'

function mapStateToProps (state, ownProps) {
  const { login } = state.openstack
  const { startLogin, loginSucceeded, loginFailed } = login
  return {
    startLogin,
    loginSucceeded,
    loginFailed,
  }
}

export class LoginPage extends React.Component {
  state = {
    username: '',
    password: '',
  }

  updateValue = key => event => {
    this.setState({ [key]: event.target.value })
  }

  performLogin = async () => {
    const { username, password } = this.state
    const { dispatch, history } = this.props
    const session = Session()
    const loginSuccessful = await dispatch(session.signIn({ username, password }))
    if (loginSuccessful) {
      // redirect to the dashboard page on successful login
      history.push('/')
    }
  }

  renderStatus = () => {
    const { startLogin, loginSucceeded, loginFailed } = this.props
    return (
      <div className="login-status">
        {startLogin && <div className="login-start">Attempting login...</div>}
        {loginSucceeded && <div className="login-succeeded login-result">Successfully logged in.</div>}
        {loginFailed && <div className="login-failed login-result">Login attempt failed.</div>}
      </div>
    )
  }

  renderHeader = () => (
    <div style={{ backgroundColor: '#4aa3df', width: '200px', padding: '0 2rem' }}>
      <img src="/logo.png" style={{ width: '200px' }} />
    </div>
  )

  renderFooter = () => (
    // TODO
    null
  )

  render () {
    const { username, password } = this.state

    return (
      <div className="login-page">
        {this.renderHeader()}
        {this.renderStatus()}
        <h2>Please sign in</h2>
        <div><input className="login-username" type="text" value={username} onChange={this.updateValue('username')} /></div>
        <div><input className="login-password" type="password" value={password} onChange={this.updateValue('password')} /></div>
        <div><Button className="login-submit" color="primary" variant="raised" onClick={this.performLogin}>Log in</Button></div>
        {this.renderFooter()}
      </div>
    )
  }
}

export default withRouter(connect(mapStateToProps)(LoginPage))
