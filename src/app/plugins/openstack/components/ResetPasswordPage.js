import React from 'react'
import axios from 'axios'
import useReactRouter from 'use-react-router'
import { withStyles } from '@material-ui/styles'
import {
  Button, Grid, Paper, Typography, List
} from '@material-ui/core'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import CheckIcon from '@material-ui/icons/Check'
import ClearIcon from '@material-ui/icons/Clear'
import ListItemText from '@material-ui/core/ListItemText'
import { propSatisfies } from 'ramda'
import useParams from 'core/hooks/useParams'

import {
  hasOneSpecialChar, hasOneNumber, hasOneUpperChar, hasOneLowerChar, hasMinLength,
  requiredValidator, passwordValidator, emailValidator
} from 'core/utils/fieldValidators'
import Progress from 'core/components/progress/Progress'
import TextField from 'core/components/validatedForm/TextField'
import Alert from 'core/components/Alert'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { compose } from 'app/utils/fp'
import { loginUrl, resetPasswordApiUrl } from 'app/constants'

const styles = theme => ({
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
    margin: 'auto'
  },
  label: {},
  form: {
    paddingTop: theme.spacing(3),
  },
  textField: {
    minWidth: '100%',
    marginTop: theme.spacing(1)
  },
  resetPwdButton: {
    minWidth: '80%',
    marginTop: theme.spacing(3),
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  paragraph: {
    marginTop: theme.spacing(1),
    textAlign: 'justify',
  }
})

const ResetPasswordPage = props => {
  const { params, updateParams } = useParams({
    loading: false,
    isError: false,
    emailId: '',
    newPassword: '',
    confirmPassword: '',
    isSetNewPasswordSuccessful: false,
    errorMessage: 'Reset password failed'
  })
  const { classes } = props
  const { history } = useReactRouter()
  const passwordValidators = [requiredValidator, passwordValidator]
  const emailValidators = [requiredValidator, emailValidator]

  const handleFormSubmit = async (data) => {
    if (params.isSetNewPasswordSuccessful) {
      return history.push(loginUrl)
    }

    if (!isPasswordMatches()) {
      updateParams({
        isError: true,
        errorMessage: 'Passwords do not match'
      })
      return
    }

    updateParams({
      loading: true
    })

    const body = { username: params.emailId, password: params.confirmPassword }

    try {
      const response = await axios.post(resetPasswordApiUrl, body)

      if (response.status === 200) {
        updateParams({
          isSetNewPasswordSuccessful: true,
          loading: false
        })
      } else {
        updateParams({
          isError: true,
          loading: false
        })
      }
    } catch (err) {
      updateParams({
        isError: true,
        loading: false
      })
    }
  }

  const updateValue = key => value => {
    updateParams({ [key]: value })
  }

  const isPasswordMatches = () => !!((params.newPassword !== '' && params.newPassword === params.confirmPassword))

  const CheckListItem = ({ children, checked }) => <ListItem>
    <ListItemIcon>
      {checked ? <CheckIcon /> : <ClearIcon color="error" />}
    </ListItemIcon>
    <ListItemText primary={children} />
  </ListItem>

  const renderPasswordValidationCheck = (values) => <Typography variant="body1" component="div">
Password must contain the following:
    <List dense>
      <CheckListItem checked={propSatisfies(hasMinLength(8), 'newPassword', values)}>
    At least 8 characters long
      </CheckListItem>
      <CheckListItem checked={propSatisfies(hasOneLowerChar, 'newPassword', values)}>
    1 Lowercase letter
      </CheckListItem>
      <CheckListItem checked={propSatisfies(hasOneUpperChar, 'newPassword', values)}>
    1 Uppercase letter
      </CheckListItem>
      <CheckListItem checked={propSatisfies(hasOneNumber, 'newPassword', values)}>
    1 Number
      </CheckListItem>
      <CheckListItem checked={propSatisfies(hasOneSpecialChar, 'newPassword', values)}>
    1 Special character - !@#$%^&*()?
      </CheckListItem>
    </List>
  </Typography>

  return (
    <Progress loading={params.loading} overlay renderContentOnMount message="Processing...">
      <Grid container justify="center" className={classes.root}>
        <Grid item md={5} lg={4}>
          <Paper className={classes.paper}>
            <img src="/ui/images/logo-color.png" className={classes.img} />
            <ValidatedForm onSubmit={handleFormSubmit}>
              {({ values }) => <>
                <Typography variant="subtitle1" align="center">
                    Password Reset
                </Typography>
                {!params.isSetNewPasswordSuccessful ? (<><TextField
                  id="email"
                  label="Email"
                  placeholder="Email"
                  type="email"
                  validations={emailValidators}
                  className={classes.confirmPassword}
                  onChange={updateValue('emailId')} />
                  <TextField variant="standard" required id="newPassword"
                    className={classes.confirmPassword} label="New Password" type="password" validations={passwordValidators}
                    onChange={updateValue('newPassword')} />
                  <TextField variant="standard" required id="confirmPassword"
                    className={classes.confirmPassword} label="Confirm Password" type="password" validations={passwordValidators}
                    onChange={updateValue('confirmPassword')} />
                  {renderPasswordValidationCheck(values)}

                  {params.isError && <Alert variant="error" message={params.errorMessage} />}
                  <Button type="submit" className={classes.resetPwdButton} variant="contained" color="primary" >
                    RESET MY PASSWORD
                  </Button></>)
                  : (<>
                    <Typography className={classes.paragraph} component="p">
                    Your was reset successfully.
                    </Typography>
                    <Button type="submit" className={classes.resetPwdButton} variant="contained" color="primary" >
                  RETURN TO LOGIN SCREEN
                    </Button></>)}</>}
            </ValidatedForm>
          </Paper>
        </Grid>
      </Grid>
    </Progress>
  )
}

export default compose(withStyles(styles))(ResetPasswordPage)
