import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import { Dialog, DialogTitle, DialogContent, RadioGroup, Radio, Grid, FormControlLabel } from '@material-ui/core'
import CancelButton from 'core/components/buttons/CancelButton'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { passwordValidator } from 'core/utils/fieldValidators'
import ApiClient from 'api-client/ApiClient'

const { keystone } = ApiClient.getInstance()

const useStyles = makeStyles(theme => ({
  dialog: {
    width: 600,
    height: 435,
  },
  radioGroup: {
    flexDirection: 'row',
  },
  formButtons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
}))

const DownloadDialog = ({ onDownloadClick, onClose, isDialogOpen }) => {
  const classes = useStyles()
  const [authMethod, setAuthMethod] = useState('token')

  const handleSubmit = async (params) => {
    const { username, password } = params
    const token = authMethod === 'token'
      ? await tokenAuth()
      : await passwordAuth(username, password)

    if (token) {
      await onDownloadClick(token)
    }
  }

  return (
    <Dialog open={isDialogOpen} onClose={onClose}>
      <DialogTitle>Download Kubeconfig</DialogTitle>
      <DialogContent>
        <ValidatedForm onSubmit={handleSubmit} fullWidth>
          <Grid container spacing={3}>
            <Grid item xs={4} zeroMinWidth>
              <h3>Authentication Method</h3>
            </Grid>
            <Grid item xs={8} zeroMinWidth>
              <RadioGroup
                value={authMethod}
                onChange={(event) => setAuthMethod(event.target.value)}
                className={classes.radioGroup}
              >
                <FormControlLabel value="token" label="Token" control={<Radio color="primary" />} />
                <FormControlLabel value="password" label="Password" control={<Radio color="primary" />} />
              </RadioGroup>
            </Grid>
            <Grid item xs={4} zeroMinWidth>
              &nbsp;
            </Grid>
            <Grid item xs={8} zeroMinWidth>
              <b>Note: </b>
              {authMethod === 'token'
                ? 'Token authentication is the preferred method for downloading kubeconfig. The kubeconfig will remain valid for the next 24 hours.'
                : 'Password authentication is less secure than token authentication, but the kubeconfig will remain functional for as long as the username and password are valid.'
              }
            </Grid>
            {authMethod === 'password' &&
              <Grid item xs={12} zeroMinWidth>
                <PasswordForm
                  classes={classes}
                />
              </Grid>
            }
            <Grid item xs={12} zeroMinWidth className={classes.formButtons}>
              <CancelButton onClick={onClose}>Cancel</CancelButton>
              <SubmitButton type={authMethod === 'token' ? 'button' : 'submit'} onClick={handleSubmit}>
                {authMethod === 'token' ? 'Download Config' : 'Validate Credentials'}
              </SubmitButton>
            </Grid>
          </Grid>
        </ValidatedForm>
      </DialogContent>
    </Dialog>
  )
}

const PasswordForm = ({ classes }) =>
  <Grid container item xs={12}>
    <Grid item xs={4} zeroMinWidth>
      <h3>Username</h3>
    </Grid>
    <Grid item xs={8} zeroMinWidth>
      <TextField id="username" label="username" required />
    </Grid>
    <Grid item xs={4} zeroMinWidth>
      <h3>Password</h3>
    </Grid>
    <Grid item xs={8} zeroMinWidth>
      <TextField
        id="password"
        label="password"
        type="password"
        validations={[passwordValidator]}
        required
      />
    </Grid>
  </Grid>

const tokenAuth = async () => keystone.renewScopedToken()

const passwordAuth = async (username, password) => {
  if (username && password) {
    const authResult = await keystone.authenticate(username, password)
    return authResult.unscopedToken
  }
}

export default DownloadDialog
