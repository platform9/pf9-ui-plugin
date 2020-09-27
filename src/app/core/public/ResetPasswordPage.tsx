import React from 'react'
import useReactRouter from 'use-react-router'
import { makeStyles } from '@material-ui/styles'
import { Button, Grid, Paper, List, InputAdornment, Theme } from '@material-ui/core'
import Text from 'core/elements/text'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import CheckIcon from '@material-ui/icons/Check'
import ClearIcon from '@material-ui/icons/Clear'
import ListItemText from '@material-ui/core/ListItemText'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import IconButton from '@material-ui/core/IconButton'
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
import Progress from 'core/components/progress/Progress'
import TextField from 'core/components/validatedForm/TextField'
import Alert from 'core/components/Alert'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { loginUrl } from 'app/constants.js'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(8),
    overflow: 'auto',
  },
  paper: {
    padding: theme.spacing(4),
  },
  img: {
    maxHeight: '70%',
    maxWidth: '70%',
    display: 'block',
    margin: 'auto',
  },
  textField: {
    minWidth: '100%',
    marginTop: `${theme.spacing(1)}px !important`,
    marginBottom: `${theme.spacing(0)} !important`,
  },
  resetPwdButton: {
    minWidth: '80%',
    marginTop: theme.spacing(3),
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    textTransform: 'uppercase',
  },
  paragraph: {
    marginTop: theme.spacing(1),
    textAlign: 'justify',
  },
  passwordValidation: {
    marginTop: theme.spacing(1),
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
    <ListItemIcon>{checked ? <CheckIcon /> : <ClearIcon color="error" />}</ListItemIcon>
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

const ResetPasswordPage: React.FC = () => {
  const classes = useStyles({})
  const { history, match, location } = useReactRouter()
  const searchParams = new URLSearchParams(location.search)
  const { params, updateParams, getParamsUpdater } = useParams({
    ...initialState,
    emailId: searchParams.get('username'),
  })
  const togglePasswordMask: ITogglePasswordMask = (key) => () =>
    updateParams({ [key]: !params[key] })
  const renderPasswordMask: IPasswordMask = (key) => ({
    endAdornment: (
      <InputAdornment position="end">
        <IconButton aria-label="toggle password visibility" onClick={togglePasswordMask(key)}>
          {params[key] ? <Visibility /> : <VisibilityOff />}
        </IconButton>
      </InputAdornment>
    ),
  })

  const SubmitButton: React.FC<{ label: string }> = ({ label }) => (
    <Button type="submit" className={classes.resetPwdButton} variant="contained" color="primary">
      {label}
    </Button>
  )

  const handleFormSubmit = async () => {
    if (params.isResetPasswordSuccessful) {
      history.push(loginUrl)
    }

    updateParams({
      loading: true,
    })

    try {
      const options: IApiData = {
        secret: match.params.id,
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
    <Progress loading={params.loading} overlay renderContentOnMount message="Processing...">
      <Grid container justify="center" className={classes.root}>
        <Grid item md={5} lg={4}>
          <Paper className={classes.paper}>
            <img src="/ui/images/logo-color.png" className={classes.img} />
            <Text variant="subtitle1" align="center">
              Password Reset
            </Text>
            <ValidatedForm elevated={false} onSubmit={handleFormSubmit}>
              {({ values }) => (
                <>
                  {!params.isResetPasswordSuccessful ? (
                    <>
                      <TextField
                        disabled
                        id="email"
                        label="Email"
                        placeholder="Email"
                        type="email"
                        value={params.emailId}
                        className={classes.textField}
                      />
                      <TextField
                        variant="standard"
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
                        variant="standard"
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
                      {params.isError && (
                        <Alert small variant="error" message={params.errorMessage} />
                      )}
                      <SubmitButton label="Reset my password" />
                    </>
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
          </Paper>
        </Grid>
      </Grid>
    </Progress>
  )
}

export default ResetPasswordPage
