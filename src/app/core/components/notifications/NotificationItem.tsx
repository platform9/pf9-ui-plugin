import React, { FC } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import Text from 'core/elements/text'
import { secondsToString } from 'utils/misc'
import moment from 'moment'
import { Notification } from 'core/notifications/notificationReducers'
import Theme from 'core/themes/model'

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    padding: theme.spacing(1, 0),
  },
  icon: {
    marginTop: theme.spacing(1),
    minWidth: theme.spacing(6),
    fontWeight: 'bold',
    color: theme.components.error.main,
  },
  content: {
    display: 'flex',
    flexFlow: 'column nowrap',
    paddingRight: theme.spacing(2),
  },
}))

const NotificationItem: FC<{ notification: Notification }> = ({ notification }) => {
  const classes = useStyles({})
  const timePassed = secondsToString(moment().diff(notification.date, 's'))
  return (
    <div className={classes.root}>
      <FontAwesomeIcon className={classes.icon}>times-circle</FontAwesomeIcon>
      <div className={classes.content}>
        <Text variant="subtitle2">{notification.title}</Text>
        <Text variant="body1">{notification.message}</Text>
        <Text variant="body2" color="textSecondary">
          {timePassed ? `${timePassed} ago` : 'Just now'}
        </Text>
      </div>
    </div>
  )
}

export default NotificationItem
