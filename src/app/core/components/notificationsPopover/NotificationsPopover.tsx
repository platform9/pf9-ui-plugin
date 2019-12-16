import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { prop } from 'ramda'
import { Popover, Typography, Tooltip, Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import NotificationItem
  from 'core/components/notificationsPopover/NotificationItem'
import {
  notificationStoreKey,
  notificationActions
} from 'core/notifications/notificationReducers'

const useStyles = makeStyles(theme => ({
  title: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightBold,
    backgroundColor: theme.palette.error.main,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(2),
  },
  notifications: {
    display: 'flex',
    flexFlow: 'column nowrap',
    padding: theme.spacing(1, 0),
    overflowY: 'auto'
  },
  icon: {
    cursor: 'pointer',
    fontWeight: 900
  },
  clearButton: {
    fontSize: theme.typography.pxToRem(12),
  },
  empty: {
    margin: theme.spacing(3, 0),
    textAlign: 'center',
  }
}))

const usePopoverStyles = makeStyles(theme => ({
  paper: {
    overflow: 'visible',
    display: 'flex',
    flexFlow: 'column nowrap',
    padding: 0,
    backgroundColor: '#FFF',
    marginTop: theme.spacing(5),
    width: 400,
    maxHeight: 600,
    border: 0,
    borderRadius: 3,
    '&:before': {
      content: '\' \'',
      position: 'absolute',
      top: -20,
      right: 10,
      borderBottom: `10px solid ${theme.palette.error.main}`,
      borderRight: '10px solid transparent',
      borderLeft: '10px solid transparent',
      borderTop: '10px solid transparent',
      zIndex: 10,
    }
  },
}))

const NotificationsPopover = ({ className }) => {
  const notifications = useSelector(prop(notificationStoreKey))
  const dispatch = useDispatch()
  const clearNotifications = () => dispatch(notificationActions.clearNotifications())
  const classes = useStyles({})
  const popoverClasses = usePopoverStyles({})
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  return <div className={className}>
    <Tooltip
      title="Notifications"
      placement="bottom"
    >
      <FontAwesomeIcon className={classes.icon} aria-describedby={id} onClick={handleClick}>
        exclamation-circle
      </FontAwesomeIcon>
    </Tooltip>
    <Popover
      id={id}
      anchorReference="anchorEl"
      anchorEl={anchorEl}
      classes={popoverClasses}
      open={open}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Typography component="div" className={classes.title} variant="caption">
        Error Notifications
      </Typography>
      <div className={classes.notifications}>
        {notifications.length
          ? notifications.map(notification =>
            <NotificationItem key={notification.id} notification={notification} />)
          : <Typography className={classes.empty} variant="subtitle2">
            There are no errors
          </Typography>}
      </div>
      {notifications.length
        ? <Button onClick={clearNotifications} className={classes.clearButton}>
          Clear List
        </Button>
        : null}
    </Popover>
  </div>
}

export default NotificationsPopover
