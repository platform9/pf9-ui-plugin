import React, { useEffect } from 'react'
import useReactRouter from 'use-react-router'
import ApiClient from 'api-client/ApiClient'
import { makeStyles } from '@material-ui/styles'
import { Button, Grid, Paper, Typography } from '@material-ui/core'
import useParams from 'core/hooks/useParams'
import Progress from 'core/components/progress/Progress'
import { loginUrl, forgotPasswordUrl, resetPasswordUrl } from 'app/constants.js'
import { Link } from 'react-router-dom'

const useStyles = makeStyles((theme: any) => ({
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
  paragraph: {
    margin: theme.spacing(1, 0),
  },
  alignMiddle: {
    textAlign: 'center',
  },
  button: {
    marginTop: theme.spacing(1),
  }
}))

export const ActivateUserPage = props => {
  const { params, updateParams } = useParams({
    loading: true,
  })
  const classes = useStyles({})
  const { history, location } = useReactRouter()

  const searchParams = new URLSearchParams(location.search)
  const username = searchParams.get('username')
  const otp = searchParams.get('otp')

  useEffect(() => {
    const { clemency } = ApiClient.getInstance()
    const validateSecret = async () => {
      try {
        const response = await clemency.verifyActivateLink(username, otp)
        history.push(`${resetPasswordUrl}/${response.value}`)
      } catch (e) {
        updateParams({ loading: false })
      }
    }
    validateSecret()
  }, [])

  return (
    <Progress
      loading={params.loading}
      overlay
      renderContentOnMount
      message="Processing..."
    >
      <Grid container justify="center" className={classes.root}>
        <Grid item md={5} lg={4}>
          <Paper className={classes.paper}>
            <img src="/ui/images/logo-color.png" className={classes.img} />
            {!params.loading && <div>
              <Typography variant="subtitle1" align="center">
                Password Reset Failed
              </Typography>
              <Typography variant="body1" className={classes.paragraph} align="center">
                Password reset link has expired, or the code is invalid.
              </Typography>
              <Typography variant="body1" className={classes.paragraph} align="center">
                <Link to={forgotPasswordUrl}>Click here</Link> to request a new password reset link.
              </Typography>
              <div className={classes.alignMiddle}>
                <Link to={loginUrl}>
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                  >
                    Return to Login Screen
                  </Button>
                </Link>
              </div>
            </div>}
          </Paper>
        </Grid>
      </Grid>
    </Progress>
  )
}

export default ActivateUserPage
