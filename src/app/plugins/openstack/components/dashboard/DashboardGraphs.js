import React from 'react'
import { withStyles } from '@material-ui/styles'
import DashboardCard from './DashboardCard'
import NetworksGraph from 'core/components/graphs/NetworksGraph'
import RegionsGraph from 'core/components/graphs/RegionsGraph'
import StorageGraph from 'core/components/graphs/StorageGraph'
import ServersGraph from 'core/components/graphs/ServersGraph'

const styles = theme => ({
  dashboardGraphs: {
    display: 'flex',
    marginTop: theme.spacing(1)
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
class DashboardGraphs extends React.PureComponent {
  render () {
    const { classes } = this.props

    return (
      <div className={classes.dashboardGraphs}>
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
