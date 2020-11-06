import React, { Fragment } from 'react'
import ApiClient from 'api-client/ApiClient'
import { Checkbox, FormControlLabel } from '@material-ui/core'
import Text from 'core/elements/text'
import { withStyles } from '@material-ui/styles'
import { compose, pathStrOr } from 'utils/fp'
import Alert from 'core/components/Alert'
import { withRouter } from 'react-router'
import SimpleLink from 'core/components/SimpleLink'
import ExternalLink from 'core/components/ExternalLink'
import { forgotPasswordUrl } from 'app/constants'
import { pathJoin } from 'utils/misc'
import { imageUrlRoot, dashboardUrl } from 'app/constants'
import moment from 'moment'
import { connect } from 'react-redux'
import { trackEvent } from 'utils/tracking'
import { MFAHelpLink } from 'k8s/links'
import { sessionActions } from 'core/session/sessionReducers'
import clsx from 'clsx'
import Input from 'core/elements/input'
import Button from 'core/elements/button'
import LoginMethodPicklist from './LoginMethodPicklist'
import axios from 'axios'

const styles = (theme) => ({
  page: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.palette.grey[900],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: 1120,
    height: 600,
    borderRadius: 16,
    border: `solid 1px ${theme.palette.grey[500]}`,
    display: 'grid',
    gridTemplateColumns: '50% 50%',
    overflow: 'hidden',
  },
  managementPlane: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 80px',
  },
  formPane: {
    padding: '40px 40px 20px',
    backgroundColor: theme.palette.grey[800],
    display: 'grid',
    gridTemplateRows: '30px 1fr 45px',
    alignItems: 'center',
    justifyItems: 'center',
    gridGap: theme.spacing(2),
  },
  form: {
    width: 280,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    height: '100%',
  },
  textField: {
    '& input': {
      backgroundColor: `${theme.palette.grey[800]} !important`,
    },
  },
  emailInput: {
    marginTop: 20,
    marginBottom: 20,
  },
  checkbox: {
    marginTop: '5px',
  },
  paragraph: {
    fontSize: 11,
    color: theme.palette.grey[300],
    textAlign: 'center',
  },
  img: {
    maxWidth: '100%',
  },
  signinButton: {
    minHeight: 54,
  },
  forgotPwd: {
    marginTop: 4,
    textAlign: 'right',
    '& a': {
      ...theme.typography.caption2,
    },
  },
  formTitle: {
    color: theme.palette.blue[200],
    fontWeight: 600,
  },
  mfa: {
    color: theme.palette.grey[200],
    ...theme.typography.caption2,
    fontWeight: 'normal',
  },
  mfaContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(),
  },
  fields: {
    flexGrow: 1,
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'center',
  },
})

interface Props {
  dispatch: any
  onAuthSuccess: any
  history: any
  classes: any
}

const authenticationMethod = async (keystone, method, username, password) => {
  if (method === 'sso') {
    return await keystone.authenticateSso()
  }
  return await keystone.authenticate(username, password)
}

@(connect() as any)
class LoginPage extends React.PureComponent<Props> {
  state = {
    username: '',
    password: '',
    loginMethod: 'local',
    MFAcheckbox: false,
    loginFailed: false,
    loading: false,
  }

  componentDidMount() {
    this.setSso()
  }

  setSso = async () => {
    const features = await axios.get('/clarity/features.json').catch(() => null)
    const sso = pathStrOr(false, 'data.experimental.sso', features)
    if (sso) {
      this.setState({ loginMethod: 'sso' })
    }
  }

  updateLoginMethod = (event) => {
    this.setState({ loginMethod: event.target.value })
  }

  updateValue = (key) => (event) => {
    this.setState({ [key]: event.target.value })
  }

  performLogin = async (event) => {
    event.preventDefault()
    const { onAuthSuccess } = this.props
    const { username: loginUsername, password, loginMethod } = this.state
    const { keystone } = ApiClient.getInstance()

    this.setState({ loginFailed: false, loading: true })

    const { unscopedToken, username, expiresAt, issuedAt } = await authenticationMethod(
      keystone,
      loginMethod,
      loginUsername,
      password,
    )
    const isSsoToken = loginMethod === 'sso'

    if (!unscopedToken) {
      return this.setState({ loading: false, loginFailed: true })
    }

    const timeDiff = moment(expiresAt).diff(issuedAt)
    const localExpiresAt = moment()
      .add(timeDiff)
      .format()

    this.props.dispatch(
      sessionActions.initSession({
        username,
        unscopedToken,
        expiresAt: localExpiresAt,
      }),
    )

    trackEvent('PF9 Signed In', {
      username,
      duDomain: window.location.origin,
    })

    await onAuthSuccess({ username, unscopedToken, expiresAt, issuedAt, isSsoToken })
    return this.setState(
      {
        loading: false,
      },
      () => this.props.history.push(dashboardUrl),
    )
  }

  handleChangeBox = (name) => (event) => {
    this.setState({ [name]: event.target.checked })
  }

  handleForgotPassword = () => (e) => {
    this.props.history.push(forgotPasswordUrl)
  }

  renderInputfield = () => {
    const { classes } = this.props
    return (
      <Fragment>
        <Input
          required
          variant="dark"
          id="email"
          label="Email"
          placeholder="Email"
          className={clsx(classes.textField, classes.emailInput)}
          onChange={this.updateValue('username')}
        />
        <Input
          required
          variant="dark"
          id="password"
          label="Password"
          className={classes.textField}
          type="password"
          onChange={this.updateValue('password')}
        />
      </Fragment>
    )
  }

  renderMFACheckbox = () => {
    const { classes } = this.props
    return (
      <Fragment>
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
            <div className={classes.mfa}>
              <span>I have a Multi-Factor Authentication (MFA) token.</span>{' '}
              <ExternalLink url={MFAHelpLink}>More info</ExternalLink>
            </div>
          }
        />
      </Fragment>
    )
  }

  renderMFAInput = () => {
    const { classes } = this.props
    return (
      <Input
        required={this.state.MFAcheckbox}
        variant="dark"
        id="MFA"
        label="MFA Code"
        className={classes.textField}
        placeholder="MFA Code"
        margin="normal"
      />
    )
  }

  renderFooter = () => {
    const { classes } = this.props
    return (
      <Fragment>
        <Text className={classes.paragraph} variant="caption" color="textSecondary">
          By signing in, you agree to our{' '}
          <ExternalLink url="https://platform9.com/terms-conditions/">
            Terms of Service
          </ExternalLink>
          . © 2014-{moment().year()} Platform9 Systems, Inc.
        </Text>
      </Fragment>
    )
  }

  render() {
    const { classes } = this.props
    const { loginFailed, loading, loginMethod } = this.state

    return (
      <section className={clsx('login-page', classes.page)}>
        <article className={classes.container}>
          <div className={clsx('left-pane', classes.managementPlane)}>
            <img
              alt="Platform9 Management Plane"
              src={pathJoin(imageUrlRoot, 'management-plane.svg')}
              className={classes.img}
            />
          </div>
          <div className={clsx('right-pane', classes.formPane)}>
            <img
              alt="Platform9"
              src={pathJoin(imageUrlRoot, 'primary-logo.svg')}
              className={classes.img}
            />
            <form className={classes.form} onSubmit={this.performLogin}>
              <Text variant="h3" className={classes.formTitle} align="center">
                Sign In
              </Text>
              <div className={classes.fields}>
                <LoginMethodPicklist
                  id="loginMethod"
                  label="Login Method"
                  variant="dark"
                  value={loginMethod}
                  onChange={this.updateLoginMethod}
                />
                {loginMethod === 'local' && (
                  <>
                    {this.renderInputfield()}
                    <Text className={classes.forgotPwd} gutterBottom>
                      <SimpleLink onClick={this.handleForgotPassword()} src={forgotPasswordUrl}>
                        Forgot password?
                      </SimpleLink>
                    </Text>
                    <div className={classes.mfaContainer}>
                      {this.renderMFACheckbox()}
                      {this.state.MFAcheckbox && this.renderMFAInput()}
                    </div>
                  </>
                )}
              </div>
              {loginFailed && <Alert small variant="error" message="Login failed" />}
              <Button
                type="submit"
                disabled={loading}
                className={classes.signinButton}
                variant="light"
                color="primary"
              >
                {loading ? 'Attempting login...' : 'Sign In'}
              </Button>
            </form>
            {this.renderFooter()}
          </div>
        </article>
      </section>
    )
  }
}

export default compose(withRouter, withStyles(styles as any))(LoginPage)
