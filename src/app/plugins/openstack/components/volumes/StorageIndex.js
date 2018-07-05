import React from 'react'
import { Grid, Paper, Tabs, Tab, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import VolumePage from './VolumesListPage'

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
    value: '/ui/openstack/storage#volumes',
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
              <Tab value="/ui/openstack/storage#volumes" label="Volumes" href="#volumes" />
              <Tab value="/ui/openstack/storage#volumetypes" label="Volume Types" href="#volumetypes" />
              <Tab value="/ui/openstack/storage#snapshots" label="Volume Snapsshots" href="#snapshots" />
            </Tabs>
            { value === '/ui/openstack/storage#volumes' && <TabContainer ><VolumePage /></TabContainer>}
            { value === '/ui/openstack/storage#volumetypes' && <TabContainer>TODO: Volume Types</TabContainer>}
            { value === '/ui/openstack/storage#snapshots' && <TabContainer>TODO: Volume Snapshots</TabContainer>}
          </Paper>
        </Grid>
      </Grid>
    )
  }
}

export default withStyles(styles)(StorageIndex)
