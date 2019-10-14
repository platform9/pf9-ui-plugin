import React from 'react'
import { compose } from 'utils/fp'
import DashboardGraphs from 'openstack/components/dashboard/DashboardGraphs'
import ProgressCardList from 'core/components/progress/ProgressCardList'
import requiresAuthentication from '../../util/requiresAuthentication'

class Dashboard extends React.PureComponent {
  render () {
    const testCards = [
      {
        title: 'Compute',
        used: 74.8,
        total: 120,
        unit: 'GHz'
      },
      {
        title: 'Memory',
        used: 489,
        total: 1174,
        unit: 'GB'
      },
      {
        title: 'Storage',
        used: 3183,
        total: 6033,
        unit: 'GB'
      }
    ]

    return (
      <div className="dashboard-page">
        <h1>This is the dashboard page</h1>
        <ProgressCardList cards={testCards} />
        <DashboardGraphs />
      </div>
    )
  }
}

export default compose(
  requiresAuthentication
)(Dashboard)
