import React, { useEffect, useRef, FC } from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { NotificationState, notificationStoreKey } from 'core/notifications/notificationReducers'
import { min, prop } from 'ramda'
import Theme from 'core/themes/model'
import { Popover, Tooltip, Menu, MenuItem } from '@material-ui/core'
import Text from 'core/elements/text'
import { routes } from 'core/utils/routes'
import clsx from 'clsx'
import ErrorIcon from '@material-ui/icons/Error'
import { ClientState, clientStoreKey } from 'core/client/clientReducers'
import SimpleLink from '../SimpleLink'
import ClusterStatusSpan from 'k8s/components/infrastructure/clusters/ClusterStatus'
import { convertTaskStateToStatus } from 'app/plugins/account/components/system-status/helpers'
import { isDecco } from 'core/utils/helpers'
import { SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import { RootState } from 'app/store'

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
  inboxMenuContainer: {
    marginTop: 15,
    minWidth: 260,
  },
  menuItem: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
    display: 'grid',
    minWidth: 150,
    gridTemplateColumns: '20px max-content 1fr',
    gridGap: theme.spacing(1),
    padding: theme.spacing(0, 2),
    minHeight: 55,
  },
  fullMenuItem: {
    gridTemplateColumns: '1fr',
    justifyItems: 'center',
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
  },
  link: {
    textDecoration: 'none !important',
    color: 'rgba(0, 0, 0, 0.87)',
  },
  systemStateItem: {
    fontSize: 16,
  },
}))

const usePopoverStyles = makeStyles<Theme>((theme) => ({
  paper: {
    overflow: 'visible',
    display: 'flex',
    flexFlow: 'column nowrap',
    padding: 0,
    backgroundColor: '#FFF',
    marginTop: 20,
    width: 400,
    maxHeight: 600,
    border: 0,
    borderRadius: 3,
    '&:before': {
      content: "' '",
      position: 'absolute',
      top: -20,
      right: 73,
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
  const { systemStatus } = useSelector<RootState, ClientState>(prop(clientStoreKey))
  const { features } = useSelector<RootState, SessionState>(prop(sessionStoreKey))
  const [lastNotification] = notifications || []
  const inboxEl = useRef<HTMLElement>(null)

  const popoverClasses = usePopoverStyles({})
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [dropdownTarget, setDropdownTarget] = React.useState(null)
  const popoverOpen = Boolean(anchorEl) && dropdownTarget === 'popover'
  const dropdownOpen = Boolean(anchorEl) && dropdownTarget === 'dropdown'
  const classes = useStyles({})
  const id = popoverOpen ? 'simple-popover' : dropdownOpen ? 'simple-dropdown' : undefined

  useEffect(() => {
    if (dropdownTarget === 'dropdown') {
      return
    }
    if (lastNotification) {
      setAnchorEl(inboxEl)
      setDropdownTarget('popover')
      clearTimeout(lastTimeout)
      lastTimeout = setTimeout(() => {
        setAnchorEl(null)
        setDropdownTarget(null)
      }, errorTimeout)
    }
  }, [lastNotification])
  const handleClose = () => {
    setAnchorEl(null)
    setDropdownTarget(null)
  }

  const handleOpenDropdown = (event) => {
    clearTimeout(lastTimeout)
    setDropdownTarget('dropdown')
    setAnchorEl(inboxEl)
  }

  // @ts-ignore
  return (
    <div className={clsx(className, classes.container)}>
      <Tooltip title={'Notifications'}>
        <FontAwesomeIcon
          onClick={handleOpenDropdown}
          aria-describedby={id}
          ref={inboxEl}
          className={classes.inbox}
        >
          inbox
        </FontAwesomeIcon>
      </Tooltip>
      {unreadCount ? <span className={classes.notifCount}>{min(unreadCount, 99)}</span> : null}
      {dropdownTarget === 'popover' && (
        <Popover
          id={id}
          anchorReference="anchorEl"
          anchorEl={anchorEl?.current}
          classes={popoverClasses}
          open={popoverOpen}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          {lastNotification?.silent === false ? (
            <Text component="div" className={classes.title} variant="caption">
              <ErrorIcon className={classes.errIcon} />
              {lastNotification?.message}
            </Text>
          ) : null}
        </Popover>
      )}
      {dropdownTarget === 'dropdown' && (
        <Menu
          id="inbox-menu"
          PopoverClasses={{ paper: classes.inboxMenuContainer }}
          anchorReference="anchorEl"
          anchorEl={anchorEl?.current}
          open={dropdownOpen}
          onClose={handleClose}
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          {isDecco(features) && (
            <SimpleLink
              src={routes.accountStatus.root.path()}
              className={classes.link}
              onClick={handleClose}
            >
              <MenuItem className={clsx(classes.menuItem, classes.fullMenuItem)}>
                <ClusterStatusSpan
                  className={classes.systemStateItem}
                  variant="header"
                  title={`System Task State: ${systemStatus?.taskState || 'Unknown'}`}
                  status={convertTaskStateToStatus[systemStatus?.taskState]}
                >
                  Management Plane Health
                </ClusterStatusSpan>
              </MenuItem>
            </SimpleLink>
          )}
          <SimpleLink
            src={routes.notifications.path()}
            className={classes.link}
            onClick={handleClose}
          >
            <DropdownMenuItem
              icon="exclamation-circle"
              count={unreadCount}
              title="Events & Errors"
            />
          </SimpleLink>
        </Menu>
      )}
    </div>
  )
}

const DropdownMenuItem: FC<{ title?: string; icon?: string; count?: number }> = ({
  title = undefined,
  icon = undefined,
  count = undefined,
  children,
  ...props
}) => {
  const classes = useStyles({})
  return (
    <MenuItem {...props} className={classes.menuItem}>
      {icon && (
        <FontAwesomeIcon size="md" className={classes.menuIcon}>
          {icon}
        </FontAwesomeIcon>
      )}
      {count && <Text variant="body1">{count}</Text>}
      {title && <Text variant="body1">{title}</Text>}
      {children}
    </MenuItem>
  )
}

export default NotificationsPopover
