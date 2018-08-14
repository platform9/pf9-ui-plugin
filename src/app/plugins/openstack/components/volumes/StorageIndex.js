import React from 'react'
import { Grid, Paper, Tabs, Tab, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import VolumesListPage from './VolumesListPage'
import VolumeTypesListPage from './VolumeTypesListPage'
import { compose } from 'react-apollo'
import { withRouter } from 'react-router'

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    boxShadow: '0 0 0 0',
    backgroundColor: theme.palette.background.default
  }
})

function TabContainer ({ children, dir }) {
  return (
    <Typography component="div" dir={dir} >
      {children}
    </Typography>
  )
}

class StorageIndex extends React.Component {
  state = {
    value: this.props.location.hash || '#volumes'
  }

  handleChange = (event, value) => {
    this.setState({ value })
  }

  render () {
    const { classes } = this.props
    const { value } = this.state
    return (
      <Grid container justify="center">
        <Grid item xs={12} zeroMinWidth>
          <Paper className={classes.root}>
            <Tabs
              value={value}
              onChange={this.handleChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab value="#volumes" label="Volumes" href="#volumes" />
              <Tab value="#volumetypes" label="Volume Types" href="#volumetypes" />
              <Tab value="#snapshots" label="Volume Snapshots" href="#snapshots" />
            </Tabs>
            { value === '#volumes' && <TabContainer ><VolumesListPage /></TabContainer>}
            { value === '#volumetypes' && <TabContainer><VolumeTypesListPage /></TabContainer>}
            { value === '#snapshots' && <TabContainer>TODO: Volume Snapshots</TabContainer>}
          </Paper>
        </Grid>
      </Grid>
    )
  }
}

export default compose(
  withStyles(styles),
  withRouter
)(StorageIndex)
