import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Paper, Typography, Grid, FormControl, MenuItem, InputLabel, Select, TextField, Checkbox, FormControlLabel, Button } from '@material-ui/core'

const styles = theme => ({
  root: {
    position: 'absolute',
    top: '20%'
  },
  paper: {

    width: 400,
    paddingLeft: 24,
    paddingRight: 24,
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
    minWidth: 360
  },
  form: {
    marginLeft: 20,
    marginRight: 20
  },
  textField: {
    marginTop: 20,
    minWidth: 360
  },
  checkbox: {
    marginTop: 20,
    marginLeft: -15
  },
  moreInfo: {
    marginLeft: 30
  },
  signinButton: {
    minWidth: 320,
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
    open: false
  }
  handleChange = name => event => {
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
                  open={this.state.open}
                  onOpen={this.handleOpen}
                  onClose={this.handleClose}
                  onChange={this.handleChange('method')}
                  value={this.state.method}
                  inputProps={{
                    id: 'logonMethod'
                  }}
                >
                  <MenuItem value={1}>'1'</MenuItem>
                  {methods.map(method =>
                    <MenuItem key={method} value={method}>
                      {method}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
              <br />
              <TextField
                required
                id="email"
                label="Email"
                className={classes.textField}
                placeholder="Email"
                margin="normal"
              />
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
