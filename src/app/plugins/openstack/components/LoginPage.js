import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { withRouter } from 'react-router'
import { withStyles } from '@material-ui/core/styles'
import { rootPath } from 'core/globals'
import { withAppContext } from 'core/AppContext'
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core'
import Alert from 'core/common/Alert'

function mapStateToProps (state, ownProps) {
  const { login } = state.openstack
  const { startLogin, loginSucceeded, loginFailed } = login
  return {
    startLogin,
    loginSucceeded,
    loginFailed,
  }
}

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 8,
    overflow: 'auto'
  },
  paper: {
    padding: theme.spacing.unit * 4
  },
  img: {
    maxHeight: '70%',
    maxWidth: '70%',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  form: {
    paddingTop: theme.spacing.unit * 3,
  },
  textField: {
    minWidth: '100%',
    marginTop: theme.spacing.unit
  },
  checkbox: {
    marginTop: theme.spacing.unit * 3
  },
  signinButton: {
    minWidth: '80%',
    marginTop: theme.spacing.unit * 3,
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  forgotPwd: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 3,
    textAlign: 'center'
  },
  paragraph: {
    textAlign: 'center'
  }
})

export class LoginPage extends React.Component {
  state = {
    username: '',
    password: '',
    MFAcheckbox: false,
    loginFailed: false,
    loading: false,
  }

  updateValue = key => event => {
    this.setState({ [key]: event.target.value })
  }

  performLogin = async (event) => {
    event.preventDefault()
    const { onAuthSuccess, context } = this.props
    const { openstackClient } = context
    const { username, password } = this.state

    this.setState({ loginFailed: false, loading: true })
    const { keystone } = openstackClient
    const unscopedToken = await keystone.authenticate(username, password)
    this.setState({ loading: false })

    if (!unscopedToken) {
      return this.setState({ loginFailed: true })
    }

    onAuthSuccess({ username, unscopedToken })
  }

  renderStatus = () => {
    const { loginSucceeded, loginFailed } = this.props
    const { loading } = this.state
    return (
      <div className="login-status">
        {loading && <div className="login-start">Attempting login...</div>}
        {loginSucceeded && <div className="login-succeeded login-result">Successfully logged in.</div>}
        {loginFailed && <div className="login-failed login-result">Login attempt failed.</div>}
      </div>
    )
  }

  handleChangeBox = name => event => {
    this.setState({ [name]: event.target.checked })
  }

  renderInputfield = () => {
    const { classes } = this.props
    return <Fragment>
      <TextField required id="email" label="Email" placeholder="Email" className={classes.textField} onChange={this.updateValue('username')} />
      <TextField required id="password" label="Password" className={classes.textField} type="password" onChange={this.updateValue('password')} />
    </Fragment>
  }

  renderMFACheckbox = () => {
    const { classes } = this.props
    return <Fragment>
      <FormControlLabel
        value="MFAcheckbox"
        className={classes.checkbox}
        control={
          <Checkbox
            checked={this.state.MFAcheckbox}
            onChange={this.handleChangeBox('MFAcheckbox')}
            value="MFAcheckbox"
            color="primary"
          />
        }
        label={
          <div>
            <span>I have a Multi-Factor Authentication (MFA) token. (</span>
            <a href="http://www.platform9.com">more info</a>
            <span>)</span>
          </div>
        }
      />
    </Fragment>
  }

  renderMFAInput = () => {
    const { classes } = this.props
    return <TextField
      required={this.state.MFAcheckbox}
      id="MFA"
      label="MFA Code"
      className={classes.textField}
      placeholder="MFA Code"
      margin="normal"
    />
  }

  renderFooter = () => {
    const { classes } = this.props
    return <Fragment>
      <Typography className={classes.paragraph} variant="caption" color="textSecondary">
        By signing in, you agree to our <a href="http://www.platform9.com">Terms of Service</a>.
      </Typography>
      <Typography className={classes.paragraph} variant="caption" color="textSecondary">
        © 2014-2018 Platform9 Systems, Inc.
      </Typography>
    </Fragment>
  }

  render () {
    const { classes } = this.props
    const { loginFailed } = this.state
    const logoPath = rootPath+'images/logo-color.png'
    return (
      <div className="login-page">
        <Grid container justify="center" className={classes.root}>
          <Grid item md={4} lg={3}>
            <Paper className={classes.paper}>
              <img src={logoPath} className={classes.img} />
              <form className={classes.form} onSubmit={this.performLogin}>
                <Typography variant="subheading" align="center">
                  Please sign in
                </Typography>
                {this.renderInputfield()}
                {this.renderMFACheckbox()}
                {this.state.MFAcheckbox && this.renderMFAInput()}
                {loginFailed && <Alert variant="error" message="Login failed" /> }
                <Button type="submit" className={classes.signinButton} variant="contained" color="primary">
                  SIGN IN
                </Button>
                <Typography className={classes.forgotPwd} gutterBottom>
                  <a href="http://www.platform9.com">Forgot password?</a>
                </Typography>
              </form>
              {this.renderFooter()}
            </Paper>
          </Grid>
        </Grid>
      </div>
    )
  }
}

LoginPage.propTypes = {
  /**
   * Handler that is invoked upon successful authentication.
  */
  onAuthSuccess: PropTypes.func.isRequired,
}

export default compose(
  withAppContext,
  withRouter,
  connect(mapStateToProps),
  withStyles(styles)
)(LoginPage)
