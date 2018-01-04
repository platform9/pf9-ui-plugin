import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import DashboardCard from './DashboardCard'
import NetworksGraph from './NetworksGraph'
import RegionsGraph from './RegionsGraph'
import StorageGraph from './StorageGraph'
import ServersGraph from './ServersGraph'

const styles = theme => ({
  'dashboard-graphs': {
    display: 'flex',
    'margin-top': '10px'
  }
})

const data = {
  servers: {
    numServers: 6
  },
  storage: {
    capacity: 15
  }
}

@withStyles(styles)
class DashboardGraphs extends React.Component {
  render () {
    const { classes } = this.props

    return (
      <div className={classes['dashboard-graphs']}>
        <DashboardCard title="Servers">
          <ServersGraph data={data.servers} />
        </DashboardCard>
        <DashboardCard title="Storage">
          <StorageGraph data={data.storage} />
        </DashboardCard>
        <DashboardCard title="Networks">
          <NetworksGraph />
        </DashboardCard>
        <DashboardCard title="Regions">
          <RegionsGraph />
        </DashboardCard>
      </div>
    )
  }
};

export default DashboardGraphs
