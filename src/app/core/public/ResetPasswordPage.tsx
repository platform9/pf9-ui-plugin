import React from 'react'
import useReactRouter from 'use-react-router'
import { Button, List, InputAdornment } from '@material-ui/core'
import Text from 'core/elements/text'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import CheckIcon from '@material-ui/icons/Check'
import ClearIcon from '@material-ui/icons/Clear'
import ListItemText from '@material-ui/core/ListItemText'
import { propSatisfies } from 'ramda'
import useParams from 'core/hooks/useParams'
import ApiClient from 'api-client/ApiClient'
import { IApiData } from 'api-client/Clemency'

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
import TextField from 'core/components/validatedForm/TextField'
import Alert from 'core/components/Alert'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { loginUrl } from 'app/constants'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import clsx from 'clsx'
import FormPageContainer from 'core/containers/form-page-container'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'

const useStyles = makeStyles((theme: Theme) => ({
  textField: {
    width: '280px !important',
    '& input': {
      height: 54,
      backgroundColor: `${theme.palette.grey[800]} !important`,
      fontSize: 18,
      color: theme.palette.blue[200],
    },
    '& fieldset': {
      border: `1px solid ${theme.palette.blue[200]} !important`,
      color: '#FFF',
      '& legend': {
        color: '#FFF',
      },
    },
    '& .MuiInputLabel-outlined': {
      top: 2,
      backgroundColor: 'transparent',
    },
  },
  emailInput: {
    marginTop: 20,
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 11,
    color: theme.palette.grey[300],
    textAlign: 'center',
  },
  formTitle: {
    color: theme.palette.blue[200],
    fontWeight: 600,
  },
  fields: {
    flexGrow: 1,
    display: 'flex',
    marginTop: '10px',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '420px',
    '& .MuiInputLabel-outlined.MuiInputLabel-shrink': {
      color: theme.palette.blue[200],
    },
  },
  passwordValidation: {
    color: '#e6e6ea',
  },
  iconColor: {
    color: '#e6e6ea',
  },
}))
interface IState {
  loading: boolean
  isError: boolean
  emailId: string
  newPassword: string
  confirmPassword: string
  isResetPasswordSuccessful: boolean
  errorMessage: string
  isNewPasswordMasked: boolean
  isConfirmPasswordMasked: boolean
}

interface IValidator {
  displayText: string
  validator: (value: string | number) => boolean
}

type PasswordMasked = 'isConfirmPasswordMasked' | 'isNewPasswordMasked'
type IPasswordMask = (key: PasswordMasked) => { [key: string]: JSX.Element }
type IPasswordValidationCheck = (passwordValue: string) => JSX.Element
type ITogglePasswordMask = (key: PasswordMasked) => () => void

const initialState: IState = {
  loading: false,
  isError: false,
  emailId: '',
  newPassword: '',
  confirmPassword: '',
  isResetPasswordSuccessful: false,
  errorMessage: 'Reset password failed',
  isNewPasswordMasked: false,
  isConfirmPasswordMasked: false,
}
const passwordValidators = [requiredValidator, passwordValidator]
const confirmPasswordValidator = [
  passwordValidator,
  matchFieldValidator('newPassword').withMessage('Passwords do not match'),
]
const passwordValidatorList: IValidator[] = [
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
const { clemency } = ApiClient.getInstance()

const CheckListItem: React.FC<{ checked: boolean }> = ({ children, checked }) => (
  <ListItem>
    <ListItemIcon>
      {checked ? <CheckIcon color="primary" /> : <ClearIcon color="error" />}
    </ListItemIcon>
    <ListItemText primary={children} />
  </ListItem>
)

const renderPasswordValidationCheck: IPasswordValidationCheck = (passwordValue) => (
  <Text variant="body1" component="div">
    Password must contain the following:
    <List dense>
      {passwordValidatorList.map((record: IValidator) => (
        <CheckListItem
          key={record.displayText}
          checked={propSatisfies(record.validator, 'newPassword', passwordValue)}
        >
          {record.displayText}
        </CheckListItem>
      ))}
    </List>
  </Text>
)

const ResetPasswordPage = () => {
  const classes = useStyles({})
  const { history, location } = useReactRouter()
  const searchParams = new URLSearchParams(location.search)
  const emailId = searchParams.get('username')
  const token = searchParams.get('token')

  const { params, updateParams, getParamsUpdater } = useParams({
    ...initialState,
    emailId,
  })
  const togglePasswordMask: ITogglePasswordMask = (key) => () =>
    updateParams({ [key]: !params[key] })
  const renderPasswordMask: IPasswordMask = (key) => ({
    endAdornment: (
      <InputAdornment position="end">
        <FontAwesomeIcon
          className={classes.iconColor}
          aria-label="toggle password visibility"
          onClick={togglePasswordMask(key)}
        >
          {params[key] ? 'eye' : 'eye-slash'}
        </FontAwesomeIcon>
      </InputAdornment>
    ),
  })

  const SubmitButton: React.FC<{ label: string }> = ({ label }) => (
    <Button type="submit" variant="contained" color="primary">
      {label}
    </Button>
  )

  const handleFormSubmit = async () => {
    if (params.isResetPasswordSuccessful) {
      history.push(loginUrl)
      return
    }

    updateParams({
      loading: true,
    })

    try {
      const options: IApiData = {
        token: token,
        username: params.emailId,
        password: params.confirmPassword,
      }
      const response = await clemency.resetPassword(options)

      if (!response.success) {
        throw new Error('Unable to reset password')
      }

      updateParams({ isResetPasswordSuccessful: true, loading: false })
    } catch (err) {
      updateParams({ isError: true, loading: false })
    }
  }

  return (
    <FormPageContainer>
      <ValidatedForm elevated={false} onSubmit={handleFormSubmit}>
        {({ values }) => (
          <>
            <Text variant="h3" className={classes.formTitle} align="center">
              Reset Password
            </Text>
            {!params.isResetPasswordSuccessful ? (
              <div className={classes.fields}>
                <TextField
                  disabled
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="Email"
                  value={params.emailId}
                  className={clsx(classes.textField, classes.emailInput)}
                />
                <TextField
                  required
                  id="newPassword"
                  label="New Password"
                  type={params.isNewPasswordMasked ? 'text' : 'password'}
                  validations={passwordValidators}
                  onChange={getParamsUpdater('newPassword')}
                  InputProps={renderPasswordMask('isNewPasswordMasked')}
                  className={classes.textField}
                />
                <TextField
                  required
                  id="confirmPassword"
                  label="Confirm Password"
                  type={params.isConfirmPasswordMasked ? 'text' : 'password'}
                  validations={confirmPasswordValidator}
                  onChange={getParamsUpdater('confirmPassword')}
                  InputProps={renderPasswordMask('isConfirmPasswordMasked')}
                  className={classes.textField}
                />
                <div className={classes.passwordValidation}>
                  {renderPasswordValidationCheck(values)}
                </div>
                {params.isError && <Alert small variant="error" message={params.errorMessage} />}
                <SubmitButton label="Reset my password" />
              </div>
            ) : (
              <>
                <Text className={classes.paragraph} component="p">
                  Your password has been reset successfully.
                </Text>
                <SubmitButton label="Return to login screen" />
              </>
            )}
          </>
        )}
      </ValidatedForm>
    </FormPageContainer>
  )
}

export default ResetPasswordPage
