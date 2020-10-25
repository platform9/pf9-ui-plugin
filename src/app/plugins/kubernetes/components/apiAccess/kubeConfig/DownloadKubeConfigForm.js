import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import { RadioGroup, Radio, Grid, FormControlLabel } from '@material-ui/core'
import SubmitButton from 'core/components/buttons/SubmitButton'
import Alert from 'core/components/Alert'
import { generateKubeConfig } from 'k8s/components/infrastructure/clusters/kubeconfig'
import downloadFile from 'core/utils/downloadFile'
import { sessionActions, sessionStoreKey } from 'core/session/sessionReducers'
import { prop } from 'ramda'
import { useSelector } from 'react-redux'

const useStyles = makeStyles((theme) => ({
  radioGroup: {
    flexDirection: 'row',
  },
  formButtons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginLeft: '-8px', // buttons have 8 px of margin
  },
  centerContent: {
    alignItems: 'center',
    display: 'flex',
  },
  errorContainer: {
    paddingLeft: '12px',
  },
}))

const DownloadKubeConfigForm = ({ cluster, onSubmit, autoDownload = true }) => {
  const classes = useStyles()
  const [authMethod, setAuthMethod] = useState('token')
  const [errorMessage, setErrorMessage] = useState()
  const [submitting, setSubmitting] = useState(false)
  const selectSessionState = prop(sessionStoreKey)
  const session = useSelector(selectSessionState)
  const { isSsoToken } = session

  const handleSubmit = async (params) => {
    setErrorMessage(null)
    setSubmitting(true)
    const { username, password } = params
    const { error, kubeconfig } = await generateKubeConfig(
      cluster.uuid,
      authMethod,
      {
        username,
        password,
      },
      isSsoToken,
    )

    if (error) {
      setSubmitting(false)
      return setErrorMessage(error)
    }

    if (autoDownload) {
      downloadFile({
        filename: `${cluster.name}.yaml`,
        contents: kubeconfig,
      })
    }
    setSubmitting(false)
    return onSubmit(kubeconfig)
  }

  return (
    <ValidatedForm onSubmit={handleSubmit} fullWidth elevated={false}>
      <Grid container spacing={3}>
        <Grid item xs={4} zeroMinWidth>
          <h4>Authentication Method</h4>
        </Grid>
        <Grid item xs={8} zeroMinWidth className={classes.centerContent}>
          <RadioGroup
            value={authMethod}
            onChange={(event) => setAuthMethod(event.target.value)}
            className={classes.radioGroup}
          >
            <FormControlLabel value="token" label="Token" control={<Radio color="primary" />} />
            <FormControlLabel
              value="password"
              label="Password"
              control={<Radio color="primary" />}
            />
          </RadioGroup>
        </Grid>
        <Grid item xs={4} zeroMinWidth>
          &nbsp;
        </Grid>
        <Grid item xs={8} zeroMinWidth>
          <b>Note: </b>
          {authMethod === 'token'
            ? 'Token authentication is the preferred method for downloading kubeconfig. The kubeconfig will remain valid for the next 24 hours.'
            : 'Password authentication is less secure than token authentication, but the kubeconfig will remain functional for as long as the username and password are valid.'}
        </Grid>
        {authMethod === 'password' && (
          <Grid item xs={12} zeroMinWidth>
            <PasswordForm classes={classes} />
          </Grid>
        )}
        {!!errorMessage && (
          <div className={classes.errorContainer}>
            <Alert small variant="error" message={errorMessage} />
          </div>
        )}
        <Grid item xs={12} zeroMinWidth className={classes.formButtons}>
          <SubmitButton
            type={authMethod === 'token' ? 'button' : 'submit'}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {authMethod === 'token' ? 'Download Config' : 'Validate + Download Config'}
          </SubmitButton>
        </Grid>
      </Grid>
    </ValidatedForm>
  )
}

const PasswordForm = ({ classes }) => (
  <Grid container item xs={12}>
    <Grid item xs={4} zeroMinWidth>
      <h4>Username</h4>
    </Grid>
    <Grid item xs={8} zeroMinWidth>
      <TextField id="username" label="username" required />
    </Grid>
    <Grid item xs={4} zeroMinWidth>
      <h4>Password</h4>
    </Grid>
    <Grid item xs={8} zeroMinWidth>
      <TextField id="password" label="password" type="password" required />
    </Grid>
  </Grid>
)

export default DownloadKubeConfigForm
