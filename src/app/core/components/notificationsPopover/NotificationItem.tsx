import React, { FC } from 'react'
import { Notification } from 'core/providers/AppProvider'
import { makeStyles } from '@material-ui/core/styles'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { Typography } from '@material-ui/core'
import { secondsToString } from 'utils/misc'
import moment from 'moment'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    padding: theme.spacing(1, 0),
  },
  icon: {
    marginTop: theme.spacing(1),
    width: theme.spacing(9),
    fontWeight: 'bold',
    color: theme.palette.error.main,
  },
  content: {
    display: 'flex',
    flexFlow: 'column nowrap'
  },
}))

const NotificationItem: FC<{ notification: Notification }> = ({ notification }) => {
  const classes = useStyles({})
  const timePassed = secondsToString(moment().diff(notification.date, 's'))
  return <div className={classes.root}>
    <FontAwesomeIcon className={classes.icon}>times-circle</FontAwesomeIcon>
    <div className={classes.content}>
      <Typography variant="subtitle2">{notification.title}</Typography>
      <Typography variant="body1">{notification.message}</Typography>
      <Typography variant="body2" color="textSecondary">{timePassed ? `${timePassed} ago` : 'Just now'}</Typography>
    </div>
  </div>
}

export default NotificationItem
