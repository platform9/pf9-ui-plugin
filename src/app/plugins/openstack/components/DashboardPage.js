import React from 'react'
import { connect } from 'react-redux'
import requiresAuthentication from '../util/requiresAuthentication'
import ProgressCardList from 'core/common/ProgressCardList'
import DashboardGraphs from 'core/common/dashboard_graphs/DashboardGraphs'

function mapStateToProps (state, ownProps) {
  return {}
}

@requiresAuthentication
@connect(mapStateToProps)
class Dashboard extends React.Component {
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

export default Dashboard
