import React, { Fragment } from 'react'
import { withStyles } from '@material-ui/styles'
import {
  Button, Checkbox, FormControlLabel, Grid, Paper, TextField, Typography,
} from '@material-ui/core'
import SimpleLink from 'core/components/SimpleLink'

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 8,
    overflow: 'auto'
  },
  paper: {
    padding: theme.spacing.unit * 4
  },
  img: {
    maxHeight: '70%',
    maxWidth: '70%',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  form: {
    paddingTop: theme.spacing.unit * 3,
  },
  textField: {
    minWidth: '100%',
    marginTop: theme.spacing.unit
  },
  checkbox: {
    marginTop: theme.spacing.unit * 3
  },
  signinButton: {
    minWidth: '80%',
    marginTop: theme.spacing.unit * 3,
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  forgotPwd: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 3,
    textAlign: 'center'
  },
  paragraph: {
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

  renderInputfield = () => {
    const { classes } = this.props
    return <Fragment>
      <TextField required id="email" label="Email" placeholder="Email" className={classes.textField} />
      <TextField required id="password" label="Password" className={classes.textField} type="password" />
    </Fragment>
  }

  renderMFACheckbox = () => {
    const { classes } = this.props
    return <Fragment>
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
            <span>I have a Multi-Factor Authentication (MFA) token. (</span>
            <SimpleLink src="http://www.platform9.com">more info</SimpleLink>
            <span>)</span>
          </div>
        }
      />
    </Fragment>
  }

  renderMFAInput = () => {
    const { classes } = this.props
    return <TextField
      required={this.state.MFAcheckbox}
      id="MFA"
      label="MFA Code"
      className={classes.textField}
      placeholder="MFA Code"
      margin="normal"
    />
  }

  renderFooter = () => {
    const { classes } = this.props
    return <Fragment>
      <Typography className={classes.paragraph} variant="caption" color="textSecondary">
        By signing in, you agree to our <SimpleLink src="http://www.platform9.com">Terms of Service</SimpleLink>.
      </Typography>
      <Typography className={classes.paragraph} variant="caption" color="textSecondary">
        © 2014-2018 Platform9 Systems, Inc.
      </Typography>
    </Fragment>
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
                <Typography variant="subtitle1" align="center">
                  Please sign in
                </Typography>
                {this.renderInputfield()}
                {this.renderMFACheckbox()}
                {this.state.MFAcheckbox && this.renderMFAInput()}
                <Button className={classes.signinButton} variant="contained" color="primary">
                  SIGN IN
                </Button>
                <Typography className={classes.forgotPwd} gutterBottom>
                  <SimpleLink src="http://www.platform9.com">Forgot password?</SimpleLink>
                </Typography>
              </form>
              {this.renderFooter()}
            </Paper>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(LoginPage)
