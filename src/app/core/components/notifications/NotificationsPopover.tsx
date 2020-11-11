import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { NotificationState, notificationStoreKey } from 'core/notifications/notificationReducers'
import { min, prop } from 'ramda'
import Theme from 'core/themes/model'
import { Popover, Tooltip } from '@material-ui/core'
import Text from 'core/elements/text'
import { routes } from 'core/utils/routes'
import useReactRouter from 'use-react-router'
import clsx from 'clsx'
import ErrorIcon from '@material-ui/icons/Error'

const useStyles = makeStyles<Theme>((theme) => ({
  title: {
    fontSize: theme.typography.pxToRem(14),
    fontWeight: theme.typography.fontWeightBold,
    backgroundColor: theme.components.error.main,
    color: theme.palette.grey[50],
    padding: theme.spacing(1),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifications: {
    display: 'flex',
    flexFlow: 'column nowrap',
    padding: theme.spacing(1, 0),
    overflowY: 'auto',
  },
  container: {
    position: 'relative',
    marginRight: theme.spacing(1),
  },
  inbox: {
    cursor: 'pointer',
    fontWeight: 900,
    color: theme.palette.grey[200],
  },
  errIcon: {
    fontWeight: 900,
    color: theme.palette.grey[200],
    marginRight: 10,
  },
  clearButton: {
    fontSize: theme.typography.pxToRem(12),
  },
  empty: {
    margin: theme.spacing(3, 0),
    textAlign: 'center',
  },
  notifCount: {
    position: 'absolute',
    fontWeight: 'bold',
    right: -9,
    top: -5,
    fontSize: theme.typography.pxToRem(10),
    color: theme.palette.grey[200],
    backgroundColor: theme.components.error.main,
    borderRadius: '50%',
    borderColor: theme.components.error.main,
    borderWidth: 1,
    borderStyle: 'solid',
    width: 16,
    height: 16,
    lineHeight: '16px',
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'center',
  },
}))

const usePopoverStyles = makeStyles<Theme>((theme) => ({
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
      content: "' '",
      position: 'absolute',
      top: -20,
      right: 10,
      borderBottom: `10px solid ${theme.components.error.main}`,
      borderRight: '10px solid transparent',
      borderLeft: '10px solid transparent',
      borderTop: '10px solid transparent',
      zIndex: 10,
    },
  },
}))

const errorTimeout = 5000
let lastTimeout

const NotificationsPopover = ({ className }) => {
  const { notifications, unreadCount } = useSelector(
    prop<string, NotificationState>(notificationStoreKey),
  )
  const { history } = useReactRouter()
  const [lastNotification] = notifications
  const inboxEl = useRef<HTMLElement>(null)

  const popoverClasses = usePopoverStyles({})
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  const classes = useStyles({})
  const id = open ? 'simple-popover' : undefined

  useEffect(() => {
    if (lastNotification) {
      setAnchorEl(inboxEl)
      clearTimeout(lastTimeout)
      lastTimeout = setTimeout(() => {
        setAnchorEl(null)
      }, errorTimeout)
    }
  }, [lastNotification])
  const handleClose = () => {
    setAnchorEl(null)
  }

  const redirectToNotifications = () => {
    history.push(routes.notifications.path())
  }

  // @ts-ignore
  return (
    <div className={clsx(className, classes.container)}>
      <Tooltip title={'Notifications'}>
        <FontAwesomeIcon
          onClick={redirectToNotifications}
          aria-describedby={id}
          ref={inboxEl}
          className={classes.inbox}
        >
          inbox
        </FontAwesomeIcon>
      </Tooltip>
      {unreadCount ? <span className={classes.notifCount}>{min(unreadCount, 99)}</span> : null}
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
        {lastNotification?.silent === false ? (
          <Text component="div" className={classes.title} variant="caption">
            <ErrorIcon className={classes.errIcon} />
            {lastNotification?.message}
          </Text>
        ) : null}
      </Popover>
    </div>
  )
}

export default NotificationsPopover
