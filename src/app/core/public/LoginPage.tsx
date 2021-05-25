import React, { Fragment } from 'react'
import { Checkbox, FormControlLabel } from '@material-ui/core'
import Text from 'core/elements/text'
import { withStyles } from '@material-ui/styles'
import { compose } from 'utils/fp'
import Alert from 'core/components/Alert'
import { withRouter } from 'react-router'
import SimpleLink from 'core/components/SimpleLink'
import ExternalLink from 'core/components/ExternalLink'
import { CustomerTiers, forgotPasswordUrl } from 'app/constants'
import { pathJoin } from 'utils/misc'
import { imageUrlRoot, dashboardUrl } from 'app/constants'
import moment from 'moment'
import { connect } from 'react-redux'
import { trackEvent } from 'utils/tracking'
import { MFAHelpLink } from 'k8s/links'
import clsx from 'clsx'
import Input from 'core/elements/input'
import Button from 'core/elements/button'
import { LoginMethodTypes } from 'app/plugins/account/components/userManagement/users/helpers'
import { authenticateUser } from 'app/plugins/account/components/userManagement/users/actions'
import Bugsnag from '@bugsnag/js'

const styles = (theme) => ({
  page: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.palette.grey[900],
    display: 'flex',
    flexFlow: 'column',
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
    padding: '48px 24px 20px',
    backgroundColor: theme.palette.grey[800],
    display: 'grid',
    gridTemplateRows: '1fr 45px',
    alignItems: 'center',
    justifyItems: 'center',
    gridGap: theme.spacing(2),
  },
  form: {
    width: 420,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    height: '100%',
  },
  textField: {
    width: 280,
    '& input': {
      height: 54,
      backgroundColor: `${theme.palette.grey[800]} !important`,
      fontSize: 18,
    },
    '& .MuiInputLabel-outlined': {
      top: 2,
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
  logo: {
    width: 200,
    marginBottom: theme.spacing(6),
  },
  signinButton: {
    minHeight: 45,
    alignSelf: 'center',
    width: 280,
  },
  forgotPwd: {
    marginTop: 4,
    textAlign: 'right',
    display: 'inline-block',
    width: 280,
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
    marginBottom: theme.spacing(),
    textAlign: 'center',
  },
  fields: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginMethods: {
    display: 'flex',
    marginTop: theme.spacing(3),
  },
  loginMethod: {
    flexGrow: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: theme.palette.grey['000'],
    borderBottomStyle: 'solid',
    borderBottomColor: theme.palette.grey['000'],
    '&.active': {
      borderBottomWidth: 3,
    },
    '&.inactive': {
      borderBottomWidth: 1,
      color: theme.palette.grey[500],
      marginBottom: 1,
      cursor: 'pointer',
    },
  },
})

interface Props {
  dispatch: any
  onAuthSuccess: any
  history: any
  classes: any
  ssoEnabled: boolean
  customerTier: string
}

@(connect() as any)
class LoginPage extends React.PureComponent<Props> {
  state = {
    username: '',
    password: '',
    loginMethod: LoginMethodTypes.Local,
    MFAcheckbox: false,
    mfa: '',
    loginFailed: false,
    loading: false,
    ssoEnabled: false,
  }

  componentDidMount() {
    if (this.props.ssoEnabled) {
      this.setState({ loginMethod: LoginMethodTypes.SSO })
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
    const { username: loginUsername, password, loginMethod, MFAcheckbox, mfa } = this.state
    this.setState({ loginFailed: false, loading: true })
    Bugsnag.leaveBreadcrumb('Attempting PF9 Sign In', {
      loginUsername,
      loginMethod,
      MFAcheckbox,
      mfa,
    })

    const { username, unscopedToken, expiresAt, issuedAt, isSsoToken } = await authenticateUser({
      loginUsername,
      password,
      loginMethod,
      MFAcheckbox,
      mfa,
    })

    if (!unscopedToken) {
      return this.setState({ loading: false, loginFailed: true })
    }

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
        id="mfa"
        label="MFA Code"
        className={classes.textField}
        placeholder="MFA Code"
        margin="normal"
        onChange={this.updateValue('mfa')}
      />
    )
  }

  renderFooter = () => {
    const { classes, customerTier } = this.props
    return customerTier !== CustomerTiers.OEM ? (
      <Fragment>
        <Text className={classes.paragraph} variant="caption" color="textSecondary">
          By signing in, you agree to our{' '}
          <ExternalLink url="https://platform9.com/terms-conditions/">
            Terms of Service
          </ExternalLink>
          . © 2014-{moment().year()} Platform9 Systems, Inc.
        </Text>
      </Fragment>
    ) : null
  }

  render() {
    const { classes, ssoEnabled } = this.props
    const { loginFailed, loading, loginMethod } = this.state

    return (
      <section className={clsx('login-page', classes.page)}>
        <img
          alt="Platform9"
          src={pathJoin(imageUrlRoot, 'primary-logo.svg')}
          className={classes.logo}
        />
        <article className={classes.container}>
          <div className={clsx('left-pane', classes.managementPlane)}>
            <img
              alt="Platform9 Management Plane"
              src={pathJoin(imageUrlRoot, 'management-plane.svg')}
              className={classes.img}
            />
          </div>
          <div className={clsx('right-pane', classes.formPane)}>
            <form className={classes.form} onSubmit={this.performLogin}>
              <Text variant="h3" className={classes.formTitle} align="center">
                Sign In
              </Text>
              {ssoEnabled && (
                <div className={classes.loginMethods}>
                  <Text
                    className={clsx(
                      classes.loginMethod,
                      loginMethod === LoginMethodTypes.Local ? 'active' : 'inactive',
                    )}
                    onClick={() => this.setState({ loginMethod: LoginMethodTypes.Local })}
                    variant="subtitle2"
                  >
                    Local Credentials
                  </Text>
                  <Text
                    className={clsx(
                      classes.loginMethod,
                      loginMethod === LoginMethodTypes.SSO ? 'active' : 'inactive',
                    )}
                    onClick={() => this.setState({ loginMethod: LoginMethodTypes.SSO })}
                    variant="subtitle2"
                  >
                    Single Sign On
                  </Text>
                </div>
              )}
              <div className={classes.fields}>
                {loginMethod === LoginMethodTypes.Local && (
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
              </div>
            </form>
            {this.renderFooter()}
          </div>
        </article>
      </section>
    )
  }
}

export default compose(withRouter, withStyles(styles as any))(LoginPage)
