import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import Session from '../actions/session'
import { withRouter } from 'react-router'
import { withStyles } from '@material-ui/core/styles'
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core'

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
    MFAcheckbox: false
  }

  updateValue = key => event => {
    this.setState({ [key]: event.target.value })
  }

  performLogin = async (event) => {
    event.preventDefault()
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
    return (
      <div className="login-page">
        <Grid container justify="center" className={classes.root}>
          <Grid item md={4} lg={3}>
            <Paper className={classes.paper}>
              <img src="/images/logo-color.png" className={classes.img} />
              <form className={classes.form} onSubmit={this.performLogin}>
                <Typography variant="subheading" align="center">
                  Please sign in
                </Typography>
                {this.renderInputfield()}
                {this.renderMFACheckbox()}
                {this.state.MFAcheckbox && this.renderMFAInput()}
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

export default compose(
  withRouter,
  connect(mapStateToProps),
  withStyles(styles)
)(LoginPage)
