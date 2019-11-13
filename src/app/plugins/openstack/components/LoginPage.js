import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import ApiClient from 'api-client/ApiClient'
import {
  Button, Checkbox, FormControlLabel, Grid, Paper, TextField, Typography,
} from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import { compose } from 'app/utils/fp'
import { withAppContext } from 'core/AppProvider'
import Alert from 'core/components/Alert'
import { withRouter } from 'react-router'
import SimpleLink from 'core/components/SimpleLink'
import ExternalLink from 'core/components/ExternalLink'
import { forgotPasswordUrl } from 'app/constants'

const styles = theme => ({
  root: {
    padding: theme.spacing(8),
    overflow: 'auto',
  },
  paper: {
    padding: theme.spacing(4),
  },
  img: {
    maxHeight: '70%',
    maxWidth: '70%',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  form: {
    paddingTop: theme.spacing(3),
  },
  textField: {
    minWidth: '100%',
    marginTop: theme.spacing(1),
  },
  checkbox: {
    marginTop: theme.spacing(3),
  },
  signinButton: {
    minWidth: '80%',
    marginTop: theme.spacing(3),
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  forgotPwd: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
    textAlign: 'center',
  },
  paragraph: {
    textAlign: 'center',
  },
  errorContainer: {
    width: '150px'
  }
})

export class LoginPage extends React.PureComponent {
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
    const { onAuthSuccess } = this.props
    const { username, password } = this.state
    const { keystone } = ApiClient.getInstance()

    this.setState({ loginFailed: false, loading: true })
    const unscopedToken = await keystone.authenticate(username, password)
    this.setState({ loading: false })

    if (!unscopedToken) {
      return this.setState({ loginFailed: true })
    }

    onAuthSuccess({ username, unscopedToken })
  }

  renderStatus = () => {
    const { loading, loginFailed } = this.state
    return (
      <div className="login-status">
        {loading && <div className="login-start">Attempting login...</div>}
        {loginFailed && <div className="login-failed login-result">Login attempt failed.</div>}
      </div>
    )
  }

  handleChangeBox = name => event => {
    this.setState({ [name]: event.target.checked })
  }

  handleForgotPassword = () => e => {
    this.props.history.push(forgotPasswordUrl)
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
            <ExternalLink
              src='https://platform9.com/support/setup-multi-factor-authentication-with-platform9/'
            >more info</ExternalLink>
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
        By signing in, you agree to our <ExternalLink src="https://platform9.com/terms-conditions/">Terms of Service</ExternalLink>.
      </Typography>
      <Typography className={classes.paragraph} variant="caption" color="textSecondary">
        © 2014-2018 Platform9 Systems, Inc.
      </Typography>
    </Fragment>
  }

  render () {
    const { classes } = this.props
    const { loginFailed } = this.state
    return (
      <div className="login-page">
        <Grid container justify="center" className={classes.root}>
          <Grid item md={4} lg={3}>
            <Paper className={classes.paper}>
              <img src="/ui/images/logo-color.png" className={classes.img} />
              <form className={classes.form} onSubmit={this.performLogin}>
                <Typography variant="subtitle1" align="center">
                  Please sign in
                </Typography>
                {this.renderInputfield()}
                {this.renderMFACheckbox()}
                {this.state.MFAcheckbox && this.renderMFAInput()}
                {loginFailed && (
                  <div className={classes.errorContainer}>
                    <Alert variant="error" message="Login failed" />
                  </div>
                )}
                <Button type="submit" className={classes.signinButton} variant="contained" color="primary">
                  SIGN IN
                </Button>
                <Typography className={classes.forgotPwd} gutterBottom>
                  <SimpleLink onClick={this.handleForgotPassword()} src={forgotPasswordUrl}>Forgot password?</SimpleLink>
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
  onAuthSuccess: PropTypes.func,
}

export default compose(
  withAppContext,
  withRouter,
  withStyles(styles),
)(LoginPage)
