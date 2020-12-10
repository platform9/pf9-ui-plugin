import React from 'react'
import { Button, makeStyles } from '@material-ui/core'
import Theme from 'core/themes/model'
import { CustomerTiers, upgradeLinks } from 'app/constants'
import ExternalLink from 'core/components/ExternalLink'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import Text from 'core/elements/text'
import { trackEvent } from 'utils/tracking'

const useStyles = makeStyles<Theme>((theme: Theme) => ({
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

interface Props {
  customerTier: CustomerTiers
  username: string
}

const trackUpgrade = ({ username, customerTier }) => {
  trackEvent(`Upgrade from ${customerTier}`, { username, du: window.location.host })
}

const UpgradeButton = ({ customerTier, username }: Props) => {
  const classes = useStyles({})
  return (
    <ExternalLink url={upgradeLinks[customerTier]} className={classes.noUnderline}>
      <Button
        className={classes.upgradeButton}
        onClick={() => trackUpgrade({ username, customerTier })}
      >
        <FontAwesomeIcon size="xs">crown</FontAwesomeIcon>
        <Text variant="caption1" className={classes.upgradeBtnText}>
          Upgrade Now
        </Text>
      </Button>
    </ExternalLink>
  )
}

export default UpgradeButton
