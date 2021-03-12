import Text from 'core/elements/text'
import React from 'react'
import UpgradeButton from 'app/plugins/account/components/secondaryHeaders/UpgradeButton'
import { makeStyles } from '@material-ui/core/styles'
import Theme from 'core/themes/model'

const useStyles = makeStyles<Theme>((theme) => ({
  modal: {
    width: '325px',
    top: '150px',
    position: 'absolute',
    border: `0.5px solid ${theme.palette.grey[300]}`,
    borderRadius: '4px',
    opacity: '1 !important',
    pointerEvents: 'auto',
    padding: theme.spacing(4),
    background: theme.palette.common.white,
    zIndex: 2,
  },
  button: {
    marginTop: theme.spacing(3),
  },
}))

const FreeTierUpgradeModal = ({ username, customerTier }) => {
  const classes = useStyles()
  return (
    <div className={classes.modal}>
      <Text variant="body2">
        All clusters will be assigned to the repository.
        <br />
        <br />
        This feature of editing assigned clusters is available to Growth and Enterprise users only.
        <br />
        <br />
        Upgrade your account now to access this feature and other great features including tailored
        support with a designated account and customer success team.
      </Text>
      <div className={classes.button}>
        <UpgradeButton username={username} customerTier={customerTier} />
      </div>
    </div>
  )
}

export default FreeTierUpgradeModal
