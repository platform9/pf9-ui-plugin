import React from 'react'
import { Button, makeStyles } from '@material-ui/core'
import Theme from 'core/themes/model'
import clsx from 'clsx'
import { useSelector } from 'react-redux'
import { SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import { RootState } from 'app/store'
import { pathOr, prop } from 'ramda'
import Text from 'core/elements/text'
import Avatar from 'core/components/Avatar'
import { CustomerTiers, upgradeLinks } from 'app/constants'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import ExternalLink from 'core/components/ExternalLink'
import { trackEvent } from 'utils/tracking'

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  myAccountHeader: {
    height: 96,
    background: theme.palette.grey[900],
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
  noUnderline: {
    '&:hover': {
      textDecoration: 'none',
    },
  },
  upgradeButton: {
    background: theme.palette.pink[500],
    color: theme.palette.grey['000'],
    textTransform: 'none',
    padding: theme.spacing(1, 3),
    '&:hover': {
      background: theme.palette.pink[500],
    },
  },
  upgradeBtnText: {
    marginLeft: theme.spacing(0.5),
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

  const customerTier = pathOr(CustomerTiers.Enterprise, ['customer_tier'], features)
  const upgradeable = [CustomerTiers.Growth, CustomerTiers.Freedom].includes(customerTier)

  const trackUpgrade = () => {
    trackEvent(`Upgrade from ${customerTier}`, { username, du: window.location.host })
  }

  return (
    <div className={clsx(classes.myAccountHeader, className)}>
      <div className={classes.upgrade}>
        {upgradeable && (
          <ExternalLink url={upgradeLinks[customerTier]} className={classes.noUnderline}>
            <Button className={classes.upgradeButton} onClick={trackUpgrade}>
              <FontAwesomeIcon size="xs">crown</FontAwesomeIcon>
              <Text variant="caption1" className={classes.upgradeBtnText}>
                Upgrade Now
              </Text>
            </Button>
          </ExternalLink>
        )}
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
