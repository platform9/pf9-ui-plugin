import React, { Component } from 'react'
import { Paper, Typography } from '@material-ui/core'

class Logon extends Component {
  render () {
    return (
      <Paper>
        <Typography variant="headline" component="h3">
           This is a sheet of paper.
        </Typography>
        <Typography component="p">
          Paper can be used to build surface or other elements for your application.
        </Typography>
      </Paper>
    )
  }
}

export default Logon
