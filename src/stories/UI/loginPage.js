import React, { Fragment } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Paper, Typography, Grid, TextField, Button, FormControlLabel, Checkbox } from '@material-ui/core'

const styles = theme => ({
  root: {
    marginTop: '5%',
    paddingTop: 25,
    paddingBottom: 30,
    overflow: 'auto'
  },
  paper: {
    paddingBottom: 25
  },
  img: {
    maxHeight: '50%',
    maxWidth: '50%',
    display: 'block',
    paddingTop: 25,
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  form: {
    paddingTop: 25,
    marginLeft: '10%',
    marginRight: '10%'
  },
  textField: {
    minWidth: '100%',
    marginTop: 10
  },
  checkbox: {
    marginTop: 20
  },
  signinButton: {
    minWidth: '80%',
    marginTop: 25,
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  forgotPwd: {
    marginTop: 15,
    marginBottom: 20,
    textAlign: 'center'
  },
  paragraph: {
    marginBottom: 10,
    textAlign: 'center'
  }
})

class LoginPage extends React.Component {
  state = {
    MFAcheckbox: false
  }
  handleChangeBox = name => event => {
    this.setState({ [name]: event.target.checked })
  }
  render () {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        <Grid container justify="center">
          <Grid item md={4} lg={3}>
            <Paper className={classes.paper}>
              <img src="https://hostadvice.com/wp-content/uploads/2017/07/Platform9-LogoStacked-777x352.png" className={classes.img} />
              <form className={classes.form}>
                <Typography variant="subheading" align="center">
                  Please sign in
                </Typography>
                <Fragment>
                  <TextField required id="email" label="Email" placeholder="Email" className={classes.textField} />
                  <TextField required id="password" label="Password" className={classes.textField} type="password" />
                  <FormControlLabel
                    className={classes.checkbox}
                    control={
                      <Checkbox
                        checked={this.state.MFAcheckbox}
                        onChange={this.handleChangeBox('MFAcheckbox')}
                        color="primary"
                      />
                    }
                    label={
                      <div>
                        <span>I have a Multi-Factor Authentication (MFA) token.</span>
                        <a href="http://www.platform9.com"> (more info)</a>
                      </div>
                    }
                  />
                  { !this.state.MFAcheckbox
                    ? null
                    : <TextField
                      required={this.state.MFAcheckbox}
                      id="MFA"
                      label="MFA Code"
                      className={classes.textField}
                      placeholder="MFA Code"
                      margin="normal"
                    />
                  }
                </Fragment>
                <Button className={classes.signinButton} variant="contained" color="primary">
                  SIGN IN
                </Button>
                <Typography className={classes.forgotPwd} gutterBottom>
                  <a href="http://www.platform9.com">Forgot password?</a>
                </Typography>
              </form>
              <Typography className={classes.paragraph} variant="caption" color="textSecondary">
                By signing in, you agree to our <a href="http://www.platform9.com">Terms of Service</a>.
              </Typography>
              <Typography className={classes.paragraph} variant="caption" color="textSecondary">
                © 2014-2018 Platform9 Systems, Inc.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(LoginPage)
