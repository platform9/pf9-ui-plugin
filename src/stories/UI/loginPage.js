import React, { Fragment } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Paper, Typography, Grid, TextField, Button } from '@material-ui/core'

const styles = theme => ({
  root: {
    marginTop: '5%',
    paddingTop: 25,
    paddingBottom: 50,
    overflow: 'auto'
  },
  paper: {
    paddingBottom: 35
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
  signinButton: {
    minWidth: '80%',
    marginTop: 35,
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto'
  }
})

class LoginPage extends React.Component {
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
                </Fragment>
                <Button className={classes.signinButton} variant="contained" color="primary">
                  SIGN IN
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(LoginPage)
