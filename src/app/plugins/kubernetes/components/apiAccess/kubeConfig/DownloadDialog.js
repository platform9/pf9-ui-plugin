import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import { Dialog, DialogTitle, DialogContent, RadioGroup, Radio, Grid, FormControlLabel } from '@material-ui/core'
import CancelButton from 'core/components/buttons/CancelButton'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { passwordValidator } from 'core/utils/fieldValidators'

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

  const tokenNote = 'Token authentication is the preferred method for downloading kubeconfig. The kubeconfig will remain valid for the next 24 hours.'
  const passwordNote = 'Password authentication is less secure than token authentication, but the kubeconfig will remain functional for as long as the username and password are valid.'

  const tokenConfirm = 'Download Config'
  const passwordConfirm = 'Validate Credentials'

  return (
    <Dialog open={isDialogOpen} onClose={onClose}>
      <DialogTitle>Download Kubeconfig</DialogTitle>
      <DialogContent>
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
            <b>Note: </b>{authMethod === 'token' ? tokenNote : passwordNote}
          </Grid>
          {authMethod === 'password' &&
            <Grid item xs={12} zeroMinWidth>
              <PasswordForm classes={classes} />
            </Grid>
          }
          <Grid item xs={12} zeroMinWidth className={classes.formButtons}>
            <CancelButton onClick={onClose}>Cancel</CancelButton>
            <SubmitButton onClick={onDownloadClick}>{authMethod === 'token' ? tokenConfirm : passwordConfirm}</SubmitButton>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

const PasswordForm = ({ classes }) =>
  <ValidatedForm fullWidth>
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
  </ValidatedForm>

export default DownloadDialog
