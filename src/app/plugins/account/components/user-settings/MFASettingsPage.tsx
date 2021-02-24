import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import Text from 'core/elements/text'
import DocumentMeta from 'core/components/DocumentMeta'
import MFAToggle from './MFAToggle'
import TextField from 'core/components/validatedForm/TextField'
import Button from 'core/elements/button'
import CopyToClipboard from 'core/components/CopyToClipboard'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import useParams from 'core/hooks/useParams'
import SubmitButton from 'core/components/buttons/SubmitButton'
import Progress from 'core/components/progress/Progress'
import MFAEnabledDialog from './MFAEnabledDialog'
import { generateRandomKey, totpUrl, verifyAuthCode } from './helpers'
import QRCode from 'qrcode.react'
import { SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import { useSelector } from 'react-redux'
import { prop } from 'ramda'
import { RootState } from 'app/store'
import { credentialActions, mngmUserActions } from '../userManagement/users/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import { disableMfa, enableMfa } from './actions'
import { IconInfo } from 'core/components/validatedForm/Info'
import { logoutUrl } from 'app/constants'
import useReactRouter from 'use-react-router'

const useStyles = makeStyles((theme: Theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
  mfaPage: {
    marginTop: theme.spacing(3),
  },
  wizardLabel: {
    margin: theme.spacing(1, 0),
  },
  field: {
    display: 'flex',
    alignItems: 'center',
  },
  copyIcon: {
    marginRight: theme.spacing(0.5),
  },
  uppercase: {
    textTransform: 'uppercase',
  },
  qrSecret: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    margin: theme.spacing(4, 0),
  },
  qrFrame: {
    border: `1px solid ${theme.palette.grey[300]}`,
    marginTop: theme.spacing(1.5),
    display: 'inline-block',
    padding: theme.spacing(7, 9.5),
  },
  fullWidth: {
    width: '100% !important',
  },
  subContent: {
    padding: theme.spacing(0, 2),
  },
  authCodes: {
    marginTop: theme.spacing(1.5),
  },
  verifyButton: {
    margin: theme.spacing(0, 4),
  },
  authCheck: {
    marginLeft: theme.spacing(2),
    color: theme.palette.green[500],
  },
  authCross: {
    marginLeft: theme.spacing(2),
    color: theme.palette.red[500],
  },
  verifyFeedback: {
    width: '50%',
    display: 'flex',
    alignItems: 'center',
  },
  mfaSwitch: {
    margin: theme.spacing(2, 0),
  },
}))

interface State {
  enableMFA: boolean
  mfaIsEnabled: boolean
  authCode1: string
  authCode2: string
  authCode1Validated: boolean
  authCode2Validated: boolean
  authCode1Incorrect: boolean
  authCode2Incorrect: boolean
  mfaSecret: string
}

const updateSsoSettings = ({ params, setLoading, setDialogOpened, updateParams, userId }) => {
  const sendRequests = async () => {
    const credential = {
      blob: params.mfaSecret,
      type: 'totp',
      user_id: userId,
    }
    const userOptions = {
      multi_factor_auth_rules: [['password', 'totp']],
    }
    setLoading(true)
    try {
      await enableMfa({ credential, userOptions, userId })
      // Show user a dialog saying mfa configuration successful
      setDialogOpened(true)
      updateParams({ mfaIsEnabled: true })
    } finally {
      setLoading(false)
    }
  }

  sendRequests()
}

const validateAuth = (params, updateParams, id) => {
  const valid = verifyAuthCode(params[id], params.mfaSecret)
  const validProperty = `${id}Validated`
  const errorProperty = `${id}Incorrect`
  updateParams({ [validProperty]: valid, [errorProperty]: !valid })
}

const confirmDialog = (setDialogOpened, history) => {
  setDialogOpened(false)
  history.push(logoutUrl)
}

const MFASettingsPage = () => {
  const classes = useStyles({})
  const {
    features,
    username,
    userDetails: { id: userId },
  } = useSelector<RootState, SessionState>(prop(sessionStoreKey)) || {}
  const { history } = useReactRouter()
  const [loading, setLoading] = useState(true)
  const [dialogOpened, setDialogOpened] = useState(false)
  const [credentials, loadingCredentials] = useDataLoader(credentialActions.list)
  const [users, loadingUsers] = useDataLoader(mngmUserActions.list)
  const { params, updateParams, getParamsUpdater } = useParams<State>({
    enableMFA: false,
    mfaIsEnabled: false,
    authCode1: '',
    authCode2: '',
    authCode1Validated: false,
    authCode2Validated: false,
    authCode1Incorrect: false,
    authCode2Incorrect: false,
    mfaSecret: '',
  })
  const { mfaSecret } = params

  const user = useMemo(() => {
    return users.find((u) => u.id === userId)
  }, [users, userId])

  const userCredential = useMemo(() => {
    if (!userId) {
      return {}
    }
    return credentials.find((credential) => {
      return credential.user_id === userId && credential.type === 'totp'
    })
  }, [userId])

  useEffect(() => {
    const getSettings = async () => {
      const mfaEnabled = user.twoFactor === 'enabled'
      if (mfaEnabled === true) {
        updateParams({
          enableMFA: true,
          mfaIsEnabled: true,
        })
      } else {
        updateParams({ mfaIsEnabled: false })
      }
      setLoading(false)
    }
    if (user) {
      getSettings()
      const newSecret = generateRandomKey()
      updateParams({ mfaSecret: newSecret })
    }
  }, [user])

  const QRLink = useMemo(() => {
    if (!features || !mfaSecret) {
      return ''
    }
    return totpUrl({ features, username, mfaSecret })
  }, [features, username, mfaSecret])

  const toggleMFA = useCallback(async () => {
    if (params.enableMFA && params.mfaIsEnabled) {
      const userOptions = {
        multi_factor_auth_rules: [['password']],
      }
      await disableMfa({ credential: userCredential, userOptions, userId })
      updateParams({ enableMFA: false, mfaIsEnabled: false })
      return
    }
    updateParams({ enableMFA: !params.enableMFA })
  }, [params, updateParams, userId])

  return (
    <div className={classes.mfaPage}>
      <Progress loading={loading || loadingCredentials || loadingUsers}>
        <DocumentMeta title="SSO Management" bodyClasses={['form-view']} />
        <ValidatedForm
          classes={{ root: classes.validatedFormContainer }}
          elevated={false}
          formActions={
            <>
              {params.enableMFA && !params.mfaIsEnabled && (
                <SubmitButton disabled={!params.authCode1Validated || !params.authCode2Validated}>
                  Confirm MFA Setup
                </SubmitButton>
              )}
            </>
          }
          onSubmit={() =>
            updateSsoSettings({ params, setLoading, setDialogOpened, updateParams, userId })
          }
        >
          <FormFieldCard title="Multifactor Authentication">
            <Text variant="body2">
              Multi-factor authentication (MFA) keeps your account secure by requiring physical
              access to your virtual MFA device.
            </Text>
            <MFAToggle
              mfaIsEnabled={params.mfaIsEnabled}
              checked={params.enableMFA}
              onClick={toggleMFA}
              className={classes.mfaSwitch}
            ></MFAToggle>
            <IconInfo
              icon="info-circle"
              title="To reset MFA code or change MFA Applications, disable and re-enable MFA."
              spacer={false}
            ></IconInfo>
          </FormFieldCard>
          {params.enableMFA && !params.mfaIsEnabled && (
            <FormFieldCard title="MFA Setup">
              <Text variant="caption1" className={classes.wizardLabel}>
                1. Scan the token QR Code with a MFA authentication application.
              </Text>
              <div className={classes.subContent}>
                <Text variant="body2">
                  Supported applications include Google Authenticator or Microsoft Authenticator.
                </Text>
                <div className={classes.qrSecret}>
                  <div>
                    <Text variant="caption1" className={classes.uppercase}>
                      MFA Token QR Code:
                    </Text>
                    {QRLink && (
                      <div className={classes.qrFrame}>
                        <QRCode size={164} value={QRLink} />
                      </div>
                    )}
                  </div>
                  <div>
                    <Text variant="caption1" className={classes.uppercase}>
                      Secret Code For Manual Configuation:
                    </Text>
                    <TextField
                      id="mfaSecret"
                      onChange={getParamsUpdater('mfaSecret')}
                      value={params.mfaSecret}
                      className={classes.fullWidth}
                      disabled
                    ></TextField>
                    <CopyToClipboard
                      copyText={params.mfaSecret}
                      copyIcon={false}
                      inline={false}
                      triggerWithChild
                    >
                      {
                        // Button component doesn't like FontAwesomeIcon as a child even though it works
                        // @ts-ignore
                        <Button type="button">
                          <FontAwesomeIcon size="sm" className={classes.copyIcon}>
                            copy
                          </FontAwesomeIcon>
                          Copy
                        </Button>
                      }
                    </CopyToClipboard>
                  </div>
                </div>
              </div>
              <Text variant="caption1" className={classes.wizardLabel}>
                2. Enter authentication codes.
              </Text>
              <Text variant="body2">
                Enter the first authentication code generated by the application and verify. Once
                the application generates the second code, enter and verify as well.
              </Text>
              <div className={classes.authCodes}>
                <div className={classes.field}>
                  <TextField
                    id="authCode1"
                    label="Authentication Code 1"
                    onChange={getParamsUpdater('authCode1')}
                    value={params.authCode1}
                  />
                  {params.authCode1Validated ? (
                    <FontAwesomeIcon className={classes.authCheck}>check</FontAwesomeIcon>
                  ) : (
                    <>
                      {params.authCode1Incorrect && (
                        <FontAwesomeIcon className={classes.authCross}>times</FontAwesomeIcon>
                      )}
                      <Button
                        type="button"
                        className={classes.verifyButton}
                        onClick={() => validateAuth(params, updateParams, 'authCode1')}
                      >
                        Verify
                      </Button>
                    </>
                  )}
                </div>
                <div className={classes.field}>
                  <TextField
                    id="authCode2"
                    label="Authentication Code 2"
                    onChange={getParamsUpdater('authCode2')}
                    value={params.authCode2}
                    disabled={!params.authCode1Validated}
                  />
                  {params.authCode2Validated ? (
                    <FontAwesomeIcon className={classes.authCheck}>check</FontAwesomeIcon>
                  ) : (
                    <div className={classes.verifyFeedback}>
                      {params.authCode2Incorrect && (
                        <FontAwesomeIcon className={classes.authCross}>times</FontAwesomeIcon>
                      )}
                      <Button
                        type="button"
                        className={classes.verifyButton}
                        onClick={() => validateAuth(params, updateParams, 'authCode2')}
                        disabled={
                          !params.authCode1Validated || params.authCode1 === params.authCode2
                        }
                      >
                        Verify
                      </Button>
                      {params.authCode1Validated && params.authCode1 === params.authCode2 && (
                        <Text variant="body2">
                          Authentication code 2 must be different than authentication code 1
                        </Text>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </FormFieldCard>
          )}
          {dialogOpened && (
            <MFAEnabledDialog onClose={() => confirmDialog(setDialogOpened, history)} />
          )}
        </ValidatedForm>
      </Progress>
    </div>
  )
}

export default MFASettingsPage
