import React from 'react'
import { makeStyles } from '@material-ui/core'
import Theme from 'core/themes/model'
import clsx from 'clsx'
import { useSelector } from 'react-redux'
import { SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import { RootState } from 'app/store'
import { pathOr, prop } from 'ramda'
import Text from 'core/elements/text'
import Avatar from 'core/components/Avatar'
import { CustomerTiers } from 'app/constants'
import UpgradeButton from './UpgradeButton'

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  myAccountHeader: {
    height: 96,
    background: theme.components.header.background,
    display: 'grid',
    gridTemplateColumns: '180px minmax(max-content, 1150px)',
  },
  upgrade: {
    width: 180,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: theme.spacing(2),
  },
  userDetails: {
    paddingBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  userIcon: {
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
    features,
  } = session

  const customerTier = pathOr(CustomerTiers.Freedom, ['customer_tier'], features)
  const upgradeable = [CustomerTiers.Growth, CustomerTiers.Freedom].includes(customerTier)

  return (
    <div className={clsx(classes.myAccountHeader, className)}>
      <div className={classes.upgrade}>
        {upgradeable && <UpgradeButton username={username} customerTier={customerTier} />}
      </div>
      <div className={classes.userDetails}>
        <Avatar
          displayName={displayName}
          diameter={48}
          fontSize={18}
          className={classes.userIcon}
        />
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
