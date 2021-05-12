import React from 'react'
import { Dialog, DialogActions } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import Text from 'core/elements/text'
import Theme from 'core/themes/model'
import Button from 'core/elements/button'
import ExternalLink from 'core/components/ExternalLink'
import { CustomerTiers, upgradeLinks } from 'app/constants'

const useStyles = makeStyles((theme: Theme) => ({
  dialogContainer: {
    padding: theme.spacing(1, 3),
  },
  dialogHeader: {
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
  },
  dialogContent: {
    margin: theme.spacing(3, 2),
    display: 'grid',
    rowGap: theme.spacing(2),
  },
}))

interface Props {
  onClose: () => void
}

const AccountUpgradeDialog = ({ onClose }: Props) => {
  const classes = useStyles({})

  return (
    <Dialog open onClose={onClose}>
      <div className={classes.dialogContainer}>
        <div className={classes.dialogHeader}>
          <Text variant="body1">Upgrade your account</Text>
        </div>
        <div className={classes.dialogContent}>
          <Text variant="body2">
            Custom Theme is only available to enterprise users of Platform9.
          </Text>
          <Text variant="body2">
            Upgrade your account now to access this feature and other great features including
            tailored support with a designated account and customer success team.
          </Text>
        </div>
        <DialogActions>
          <Button color="secondary" onClick={onClose}>
            Cancel
          </Button>
          <ExternalLink url={upgradeLinks[CustomerTiers.Growth]}>
            <Button>Upgrade Now</Button>
          </ExternalLink>
        </DialogActions>
      </div>
    </Dialog>
  )
}

export default AccountUpgradeDialog
