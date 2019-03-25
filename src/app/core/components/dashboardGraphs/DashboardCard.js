import React from 'react'
import { withStyles } from '@material-ui/styles'

const styles = theme => ({
  'dashboard-card': {
    'flex-grow': '1',
    width: '100%',
    'margin-right': '5px',
    '&:last-child': {
      'margin-right': '0px'
    }
  },
  'dashboard-card-title': {
    background: '#dbedf9',
    padding: '10px 15px',
    'margin-bottom': '2px'
  },
  'dashboard-card-title-text': {
    margin: '0px',
    'font-weight': '400'
  },
  'dashboard-card-contents': {
    border: '10px solid #edf6fc',
    height: '300px',
    position: 'relative',
    display: 'flex',
    'align-items': 'center'
  }
})

@withStyles(styles)
class DashboardCard extends React.Component {
  render () {
    const { classes, children, title } = this.props

    return (
      <div className={classes['dashboard-card']}>
        <div className={classes['dashboard-card-title']}>
          <h2 className={classes['dashboard-card-title-text']}>{title}</h2>
        </div>
        <div className={classes['dashboard-card-contents']}>
          {children}
        </div>
      </div>
    )
  }
};

export default DashboardCard
