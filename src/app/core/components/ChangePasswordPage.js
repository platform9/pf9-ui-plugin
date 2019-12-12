import React, { useContext } from 'react'
import useReactRouter from 'use-react-router'
import { withStyles } from '@material-ui/styles'
import { Button, Typography, List, Dialog, DialogTitle, DialogContent } from '@material-ui/core'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import CheckIcon from '@material-ui/icons/Check'
import ClearIcon from '@material-ui/icons/Clear'
import ListItemText from '@material-ui/core/ListItemText'
import uuid from 'uuid'
import { propSatisfies, isNil, reject } from 'ramda'
import ApiClient from 'api-client/ApiClient'
import useParams from 'core/hooks/useParams'
import Progress from 'core/components/progress/Progress'
import TextField from 'core/components/validatedForm/TextField'
import Alert from 'core/components/Alert'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { AppContext } from 'core/providers/AppProvider'
import { loginUrl } from 'app/constants.js'

import {
  hasOneSpecialChar,
  hasOneNumber,
  hasOneUpperChar,
  hasOneLowerChar,
  hasMinLength,
  requiredValidator,
  passwordValidator,
} from 'core/utils/fieldValidators'

const styles = (theme) => ({
  formContainer: {
    margin: '0 37px',
  },
  alertContainer: {
    width: '300px',
  },
  marginLeft: {
    marginLeft: '25px',
  },
})

const ChangePasswordPage = (props) => {
  const { params, updateParams } = useParams({
    loading: false,
    isError: false,
    newPassword: '',
    confirmPassword: '',
    isChangePasswordSuccessful: false,
    errorMessage: 'Change password failed',
  })

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

  const { classes } = props
  const { history } = useReactRouter()
  const passwordValidators = [requiredValidator, passwordValidator]
  const {
    setContext,
    userDetails: { userId },
  } = useContext(AppContext)
  const { keystone } = ApiClient.getInstance()

  const handleCancel = () => setContext({ isChangePassword: false })

  const handleFormSubmit = async (data) => {
    if (params.isChangePasswordSuccessful) {
      await setContext({ isChangePassword: false })
      history.push(loginUrl)
    }

    if (!isPasswordMatches()) {
      updateParams({
        isError: true,
        errorMessage: 'Passwords do not match',
      })
      return
    }

    if (isNil(params.oldPassword)) {
      updateParams({
        isError: true,
        errorMessage: 'Enter Old Password',
      })
      return
    }

    await updateParams({
      loading: true,
    })

    try {
      const body = { original_password: params.oldPassword, password: params.confirmPassword }
      const updateUserPromise = keystone.updateUserPassword(userId, body)
      await updateUserPromise.then((res) => (isNil(res) ? reject(isNil) : undefined))
      await updateParams({ isChangePasswordSuccessful: true, loading: false })
      await setContext({ isChangePassword: false })
      history.push({
        pathname: loginUrl,
        toastData: {
          showMessage: true,
          isOpen: true,
          id: uuid.v4(),
          text: 'Successfully updated password. Please log in with new password.',
          variant: 'success',
        },
      })
    } catch (err) {
      updateParams({ isError: true, loading: false })
    }
  }

  const updateValue = (key) => (value) => {
    updateParams({ [key]: value })
  }

  const isPasswordMatches = () =>
    !!(params.newPassword !== '' && params.newPassword === params.confirmPassword)

  const CheckListItem = ({ children, checked }) => (
    <ListItem>
      <ListItemIcon>{checked ? <CheckIcon /> : <ClearIcon color="error" />}</ListItemIcon>
      <ListItemText primary={children} />
    </ListItem>
  )

  const renderPasswordValidationCheck = (values) => (
    <Typography variant="body1" component="div">
      Password must contain the following:
      <List dense>
        {passwordValidatorList.map((record) => (
          <CheckListItem
            key={uuid()}
            checked={propSatisfies(record.validator, 'newPassword', values)}
          >
            {record.displayText}
          </CheckListItem>
        ))}
      </List>
    </Typography>
  )

  return (
    <Dialog open fullWidth maxWidth="xs">
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
        <Progress loading={params.loading} overlay renderContentOnMount message="Processing...">
          <div className={classes.formContainer}>
            <ValidatedForm onSubmit={handleFormSubmit}>
              {({ values }) => (
                <>
                  <TextField
                    variant="standard"
                    required
                    id="oldPassword"
                    className={classes.confirmPassword}
                    label="Old Password"
                    type="password"
                    onChange={updateValue('oldPassword')}
                  />
                  <TextField
                    variant="standard"
                    required
                    id="newPassword"
                    className={classes.confirmPassword}
                    label="New Password"
                    type="password"
                    validations={passwordValidators}
                    onChange={updateValue('newPassword')}
                  />
                  <TextField
                    variant="standard"
                    required
                    id="confirmPassword"
                    className={classes.confirmPassword}
                    label="Confirm Password"
                    type="password"
                    validations={passwordValidators}
                    onChange={updateValue('confirmPassword')}
                  />
                  {renderPasswordValidationCheck(values)}
                  {params.isError && (
                    <div className={classes.alertContainer}>
                      <Alert variant="error" message={params.errorMessage} />
                    </div>
                  )}
                </>
              )}
            </ValidatedForm>
            <Button variant="contained" color="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.marginLeft}
              onClick={handleFormSubmit}
            >
              Save
            </Button>
          </div>
        </Progress>
      </DialogContent>
    </Dialog>
  )
}

export default withStyles(styles)(ChangePasswordPage)
