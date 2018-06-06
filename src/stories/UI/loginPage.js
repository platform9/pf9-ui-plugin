import React, { Fragment } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Paper, Typography, Grid, FormControl, MenuItem, InputLabel, Select, TextField, Checkbox, FormControlLabel, Button } from '@material-ui/core'

const styles = theme => ({
  root: {
    // display: 'flex',
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
  signinButton: {
    minWidth: '80%',
    marginTop: 20,
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto'
  }
})

class LoginPage extends React.Component {
  state = {
    username: '',
    password: '',
    MFAcheckbox: false,
    method: '',
    open: false,
    SSOhidden: false
  }

  renderHeader = () => (
    <div style={{ backgroundColor: '#4aa3df', width: '200px', padding: '0 2rem' }}>
      <img src="/logo.png" style={{ width: '200px' }} />
    </div>
  )

  renderFooter = () => (
    // TODO
    null
  )

  render () {
    // const { username, password } = this.state
    const { classes } = this.props
    return (
      <div>
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
              <img src="https://hostadvice.com/wp-content/uploads/2017/07/Platform9-LogoStacked-777x352.png" className={classes.img} />
              <form className={classes.form}>
                <Typography variant="subheading" align="center">
                  Please sign in
                </Typography>
                <Fragment>
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
                </Fragment>
                <br />
                <Button
                  className={classes.signinButton}
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  SIGN IN
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </div>

      // <div className="login-page">
      //   {this.renderHeader()}
      //   {this.renderStatus()}
      //   <h2>Please sign in</h2>
      //   <div><input className="login-username" type="text" value={username} onChange={this.updateValue('username')} /></div>
      //   <div><input className="login-password" type="password" value={password} onChange={this.updateValue('password')} /></div>
      //   <div><Button className="login-submit" color="primary" variant="raised" onClick={this.performLogin}>Log in</Button></div>
      //   {this.renderFooter()}
      // </div>
    )
  }
}

export default withStyles(styles)(LoginPage)
