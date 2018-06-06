import React, { Component, Fragment } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Paper, Typography, Grid, FormControl, MenuItem, InputLabel, Select, TextField, Checkbox, FormControlLabel, Button } from '@material-ui/core'

const styles = theme => ({
  root: {
    display: 'flex',
    position: 'absolute',
    top: '10%',
    paddingBottom: 50,
    overflow: 'auto'
  },
  paper: {
    // width: 400,
    // paddingLeft: 24,
    // paddingRight: 24,
    paddingBottom: 20
  },
  img: {
    maxHeight: '50%',
    maxWidth: '50%',
    display: 'block',
    paddingTop: 24,
    paddingBottom: 25,
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  formControl: {
    minWidth: '100%',
    visibility: 'display'
  },
  form: {
    marginLeft: '10%',
    marginRight: '10%'
  },
  textField: {
    minWidth: '100%',
    marginTop: 10
  },
  checkbox: {
    marginTop: 20,
    marginLeft: -15
  },
  moreInfo: {
    marginLeft: 30
  },
  signinButton: {
    minWidth: '80%',
    marginTop: 20,
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  forgotPwd: {
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center'
  },
  paragraph: {
    marginBottom: 10,
    textAlign: 'center'
  }
})

class Logon extends Component {
  state = {
    MFAcheckbox: false,
    method: '',
    open: false,
    SSOhidden: false
  }
  handleChange = name => event => {
    if (event.target.value === 'Single sign-on') {
      this.setState({
        SSOhidden: true
      })
    } else {
      this.setState({
        SSOhidden: false
      })
    }
    this.setState({ [name]: event.target.value })
  }

  handleChangeBox = name => event => {
    this.setState({ [name]: event.target.checked })
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  handleOpen = () => {
    this.setState({ open: true })
  }

  render () {
    const { classes } = this.props
    const methods = ['Local credentials', 'Single sign-on']
    return (
      <Grid
        container
        className={classes.root}
        justify="center"
        alignItems="center"
        direction="row"
      >
        <Grid
          item
          md={4}
          sm={6}
          xs={12}
        >
          <Paper className={classes.paper}>
            <img src="../../Images/logo.png" className={classes.img} />
            <form className={classes.form}>
              <Typography variant="subheading" align="center">
                Please sign in
              </Typography>
              <br />
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="logonMethod">Logon method</InputLabel>
                <Select
                  anchorreference="anchorEl"
                  open={this.state.open}
                  onOpen={this.handleOpen}
                  onClose={this.handleClose}
                  onChange={this.handleChange('method')}
                  value={this.state.method}
                  inputProps={{
                    id: 'logonMethod'
                  }}
                >
                  {methods.map(method =>
                    <MenuItem key={method} value={method}>
                      {method}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
              <br />
              { this.state.SSOhidden
                ? null
                : <Fragment>
                  <TextField
                    required
                    id="email"
                    label="Email"
                    className={classes.textField}
                    placeholder="Email"
                    margin="normal"
                  />
                  <br />
                  <TextField
                    required
                    id="password"
                    label="Password"
                    className={classes.textField}
                    type="password"
                    margin="normal"
                  />
                  <FormControlLabel
                    className={classes.checkbox}
                    control={
                      <Checkbox
                        checked={this.state.MFAcheckbox}
                        onChange={this.handleChangeBox('MFAcheckbox')}
                        value="MFAcheckbox"
                        color="primary"
                      />
                    }
                    label="I have a Multi-Factor Authentication (MFA) token."
                  />
                  <Typography
                    className={classes.moreInfo}
                    variant="caption"
                  >
                    <a href="http://www.platform9.com">(more info)</a>
                  </Typography>
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
              }
              <Button
                className={classes.signinButton}
                variant="contained"
                color="primary"
                size="large"
              >
                SIGN IN
              </Button>
              <Typography
                className={classes.forgotPwd}
                gutterBottom
              >
                <a href="http://www.platform9.com">Forgot password?</a>
              </Typography>
            </form>
            <Typography
              className={classes.paragraph}
              variant="caption"
              color="textSecondary"
            >
              By signing in, you agree to our <a href="http://www.platform9.com">Terms of Service</a>.
            </Typography>
            <Typography
              className={classes.paragraph}
              variant="caption"
              color="textSecondary"
            >
              © 2014-2018 Platform9 Systems, Inc.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    )
  }
}

export default withStyles(styles)(Logon)
