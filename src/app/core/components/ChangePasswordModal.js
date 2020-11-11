import React from 'react'
import useReactRouter from 'use-react-router'
import { makeStyles } from '@material-ui/styles'
import { List, Dialog, DialogTitle, DialogContent, Grid, InputAdornment } from '@material-ui/core'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import CheckIcon from '@material-ui/icons/Check'
import ClearIcon from '@material-ui/icons/Clear'
import ListItemText from '@material-ui/core/ListItemText'
import { propSatisfies, isNil, prop } from 'ramda'
import Text from 'core/elements/text'
import useParams from 'core/hooks/useParams'
import Progress from 'core/components/progress/Progress'
import TextField from 'core/components/validatedForm/TextField'
import Alert from 'core/components/Alert'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import CancelButton from 'core/components/buttons/CancelButton'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { logoutUrl } from 'app/constants'
import { useToast } from 'core/providers/ToastProvider'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import IconButton from '@material-ui/core/IconButton'
import {
  hasOneSpecialChar,
  hasOneNumber,
  hasOneUpperChar,
  hasOneLowerChar,
  hasMinLength,
  requiredValidator,
  passwordValidator,
  matchFieldValidator,
} from 'core/utils/fieldValidators'
import actions from './actions'
import { sessionStoreKey } from 'core/session/sessionReducers'
import { useSelector } from 'react-redux'

const useStyles = makeStyles((theme) => ({
  alertContainer: {
    width: '300px',
  },
  eye: {
    cursor: 'pointer',
  },
}))

const passwordValidators = [requiredValidator, passwordValidator]
const confirmPasswordValidator = [
  passwordValidator,
  matchFieldValidator('newPassword').withMessage('Passwords do not match'),
]
const initialState = {
  loading: false,
  isError: false,
  newPassword: '',
  confirmPassword: '',
  isChangePasswordSuccessful: false,
  errorMessage: 'Change password failed',
  isNewPasswordMasked: false,
  isOldPasswordMasked: false,
  isConfirmPasswordMasked: false,
}

const passwordValidatorList = [
  {
    displayText: 'At least 8 characters long',
    validator: hasMinLength(8),
  },
  {
    displayText: '1 Lowercase letter',
    validator: hasOneLowerChar,
  },
  {
    displayText: '1 Uppercase letter',
    validator: hasOneUpperChar,
  },
  {
    displayText: '1 Number',
    validator: hasOneNumber,
  },
  {
    displayText: '1 Special character - !@#$%^&*()?',
    validator: hasOneSpecialChar,
  },
]

const CheckListItem = ({ children, checked }) => (
  <ListItem>
    <ListItemIcon>{checked ? <CheckIcon /> : <ClearIcon color="error" />}</ListItemIcon>
    <ListItemText primary={children} />
  </ListItem>
)

const renderPasswordValidationCheck = (values) => (
  <Text variant="body1" component="div">
    Password must contain the following:
    <List dense>
      {passwordValidatorList.map((record) => (
        <CheckListItem
          key={record.displayText}
          checked={propSatisfies(record.validator, 'newPassword', values)}
        >
          {record.displayText}
        </CheckListItem>
      ))}
    </List>
  </Text>
)

const ChangePasswordModal = (props) => {
  const { params, updateParams, getParamsUpdater } = useParams(initialState)
  const classes = useStyles()
  const { history } = useReactRouter()
  const {
    userDetails: { userId },
  } = useSelector(prop(sessionStoreKey))
  const showToast = useToast()

  const togglePasswordMask = (key) => () => {
    updateParams({ [key]: !params[key] })
  }

  const handleFormSubmit = async (data) => {
    if (params.isChangePasswordSuccessful) {
      props.onCancel()
      history.push(logoutUrl)
    }

    updateParams({
      loading: true,
    })

    try {
      const response = await actions.updateUserPassword({ ...params, userId })

      // Empty response means request completed successfully else error
      if (!isNil(response)) {
        throw new Error()
      }

      updateParams({ isChangePasswordSuccessful: true, loading: false })
      props.onCancel()
      showToast('Successfully updated password. Please log in with new password.', 'success')
      history.push(logoutUrl)
    } catch (err) {
      updateParams({ isError: true, loading: false })
    }
  }

  return (
    <Dialog open fullWidth maxWidth="xs">
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
        <Progress loading={params.loading} overlay renderContentOnMount message="Processing...">
          <Grid container justify="center">
            <Grid item>
              <ValidatedForm onSubmit={handleFormSubmit}>
                {({ values }) => (
                  <>
                    <TextField
                      variant="standard"
                      required
                      id="oldPassword"
                      label="Old Password"
                      type={params.isOldPasswordMasked ? 'text' : 'password'}
                      onChange={getParamsUpdater('oldPassword')}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={togglePasswordMask('isOldPasswordMasked')}
                            >
                              {params.isOldPasswordMasked ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      variant="standard"
                      required
                      id="newPassword"
                      label="New Password"
                      type={params.isNewPasswordMasked ? 'text' : 'password'}
                      validations={passwordValidators}
                      onChange={getParamsUpdater('newPassword')}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={togglePasswordMask('isNewPasswordMasked')}
                            >
                              {params.isNewPasswordMasked ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      variant="standard"
                      required
                      id="confirmPassword"
                      label="Confirm Password"
                      type={params.isConfirmPasswordMasked ? 'text' : 'password'}
                      validations={confirmPasswordValidator}
                      onChange={getParamsUpdater('confirmPassword')}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={togglePasswordMask('isConfirmPasswordMasked')}
                            >
                              {params.isConfirmPasswordMasked ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    {renderPasswordValidationCheck(values)}
                    {params.isError && (
                      <div className={classes.alertContainer}>
                        <Alert variant="error" message={params.errorMessage} />
                      </div>
                    )}
                    <Grid container spacing={4}>
                      <Grid item>
                        <CancelButton onClick={props.onCancel} />
                      </Grid>
                      <Grid item>
                        <SubmitButton> Save </SubmitButton>
                      </Grid>
                    </Grid>
                  </>
                )}
              </ValidatedForm>
            </Grid>
          </Grid>
        </Progress>
      </DialogContent>
    </Dialog>
  )
}

export default ChangePasswordModal
