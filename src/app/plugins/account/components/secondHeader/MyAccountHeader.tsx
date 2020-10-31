import React from 'react'
import { makeStyles, Theme } from '@material-ui/core'
import clsx from 'clsx'
import { useSelector } from 'react-redux'
import { SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import { RootState } from 'app/store'
import { prop } from 'ramda'
import Text from 'core/elements/text'

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  root: {
    height: 96,
    background: theme.palette.grey[900],
    display: 'flex',
  },
  upgrade: {
    width: 180,
  },
  userDetails: {
    paddingBottom: theme.spacing(2),
    flexGrow: 1,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    maxWidth: '75%',
  },
  userIcon: {
    borderRadius: '50%',
    background: theme.palette.grey[200],
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    textTransform: 'uppercase',
    fontWeight: 600,
    height: 48,
    width: 48,
    fontSize: 18,
    cursor: 'default',
    marginLeft: theme.spacing(4),
  },
  displayName: {
    display: 'inline-block',
    color: theme.palette.grey['000'],
    marginLeft: theme.spacing(2),
    flexGrow: 1,
  },
  username: {
    display: 'inline-block',
    color: theme.palette.grey['000'],
  },
}))

const MyAccountHeader = ({ className }) => {
  const classes = useStyles({})
  const session = useSelector<RootState, SessionState>(prop(sessionStoreKey))
  const {
    username,
    userDetails: { displayName },
  } = session

  return (
    <div className={clsx(classes.root, className)}>
      <div className={classes.upgrade}></div>
      <div className={classes.userDetails}>
        <div className={classes.userIcon}>{displayName[0]}</div>
        <Text variant="h3" className={classes.displayName}>
          {displayName}
        </Text>
        <Text variant="body1" className={classes.username}>
          {username}
        </Text>
      </div>
    </div>
  )
}

export default MyAccountHeader
