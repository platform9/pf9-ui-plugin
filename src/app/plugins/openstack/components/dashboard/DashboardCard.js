import React from 'react'
import { withStyles } from '@material-ui/styles'

const styles = theme => ({
  dashboardCard: {
    flexGrow: '1',
    width: '100%',
    marginRight: 5,
    '&:last-child': {
      marginRight: '0px',
    },
  },
  dashboardCardTitle: {
    background: '#DBEDF9',
    padding: '10px 15px',
    marginBottom: '2px',
  },
  dashboardCardTitleText: {
    margin: '0px',
    fontWeight: '400',
  },
  dashboardCardContents: {
    border: '10px solid #edf6fc',
    height: '300px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
})

@withStyles(styles)
class DashboardCard extends React.PureComponent {
  render () {
    const { classes, children, title } = this.props

    return (
      <div className={classes.dashboardCard}>
        <div className={classes.dashboardCardTitle}>
          <h2 className={classes.dashboardCardTitleText}>{title}</h2>
        </div>
        <div className={classes.dashboardCardContents}>
          {children}
        </div>
      </div>
    )
  }
}

export default DashboardCard
