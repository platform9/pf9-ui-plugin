import React from 'react'
import axios from 'axios'
import useReactRouter from 'use-react-router'
import { makeStyles } from '@material-ui/styles'
import { Button, Grid, Paper, TextField, Typography } from '@material-ui/core'
import useParams from 'core/hooks/useParams'
import Progress from 'core/components/progress/Progress'
import Alert from 'core/components/Alert'
import { loginUrl, forgotPasswordApiUrl } from 'app/constants.js'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(8),
    overflow: 'auto'
  },
  paper: {
    padding: theme.spacing(4)
  },
  img: {
    maxHeight: '70%',
    maxWidth: '70%',
    display: 'block',
    margin: 'auto'
  },
  form: {
    paddingTop: theme.spacing(3)
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
    textTransform: 'uppercase'
  },
  paragraph: {
    marginTop: theme.spacing(1),
    textAlign: 'justify'
  },
  errorContainer: {
    width: '150px'
  }
}))

const ForgotPasswordPage = props => {
  const { params, updateParams } = useParams({
    loading: false,
    isError: false,
    emailId: '',
    isResetSuccessful: false,
    errorMessage: 'Reset password failed'
  })
  const { history } = useReactRouter()
  const classes = useStyles()

  const handleEmailChange = () => event => {
    updateParams({
      emailId: event.target.value
    })
  }

  const handleFormSubmit = async event => {
    event.preventDefault()

    if (params.isResetSuccessful) {
      history.push(loginUrl)
    }

    updateParams({
      loading: true
    })

    const body = { username: params.emailId }

    try {
      const response = await axios.post(forgotPasswordApiUrl, body)

      response.status === 200
        ? updateParams({ isResetSuccessful: true, loading: false })
        : updateParams({ isError: true, loading: false })
    } catch (err) {
      updateParams({ isError: true, loading: false })
    }
  }

  const SubmitButton = ({ label }) => (
    <Button
      type="submit"
      className={classes.resetPwdButton}
      variant="contained"
      color="primary"
    >
      {label}
    </Button>
  )

  return (
    <Progress
      loading={params.loading}
      overlay
      renderContentOnMount
      message="Processing..."
    >
      <div className="forgot-password-page">
        <Grid container justify="center" className={classes.root}>
          <Grid item md={4} lg={3}>
            <Paper className={classes.paper}>
              <img src="/ui/images/logo-color.png" className={classes.img} />
              <form className={classes.form} onSubmit={handleFormSubmit}>
                <Typography variant="subtitle1" align="center">
                  Password Reset
                </Typography>
                {!params.isResetSuccessful ? (
                  <>
                    <TextField
                      required
                      id="email"
                      label="Email"
                      placeholder="Email"
                      type="email"
                      className={classes.textField}
                      onChange={handleEmailChange()}
                    />
                    {params.isError && (
                      <div className={classes.errorContainer}>
                        <Alert variant="error" message="Something went wrong" />
                      </div>
                    )}
                    <SubmitButton label="Reset my password" />
                  </>
                ) : (
                  <>
                    <Typography className={classes.paragraph} component="p">
                      Your request was received successfully. You should receive
                      an email shortly for <b>{params.emailId}</b> with
                      instructions to reset your password.
                    </Typography>
                    <SubmitButton label="Return to login screen" />
                  </>
                )}
              </form>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </Progress>
  )
}

export default ForgotPasswordPage
