import React, { useCallback, useState } from 'react'
import { Dialog, DialogActions, makeStyles } from '@material-ui/core'
import Theme from 'core/themes/model'
import Button from 'core/elements/button'
import Text from 'core/elements/text'
import { patchRbacProfile, rbacProfilesActions } from './actions'
import useDataLoader from 'core/hooks/useDataLoader'

const useStyles = makeStyles<Theme>((theme) => ({
  outlinedButton: {
    background: theme.palette.grey['000'],
    color: theme.palette.blue[500],
  },
  dialogContainer: {
    padding: theme.spacing(1, 3),
  },
  dialogHeader: {
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
  },
  dialogContent: {
    margin: theme.spacing(3, 2),
  },
}))

interface Props {
  profile: any // make profile model
  className?: string
}

const ProfilePublishDialog = ({ profile, className = '' }: Props) => {
  const classes = useStyles({})
  const [showModal, setModal] = useState(false)

  const handleOpen = () => setModal(true)
  const handleClose = () => setModal(false)

  const [, , reloadRbacProfiles] = useDataLoader(rbacProfilesActions.list)

  const publishProfile = useCallback(async () => {
    const body = {
      status: {
        phase: 'published',
      },
    }
    await patchRbacProfile(profile.metadata.name, body)
    reloadRbacProfiles(true)
    handleClose()
  }, [profile, handleClose])

  const renderModalContent = () => (
    <Dialog open fullWidth maxWidth="sm" onClose={handleClose}>
      <div className={classes.dialogContainer}>
        <Text variant="body1" className={classes.dialogHeader}>
          Publish RBAC Profile
        </Text>
        <div className={classes.dialogContent}>
          <Text variant="body2">
            Are you sure you would like to publish {profile.metadata.name}?
          </Text>
          <Text variant="body2">
            Once the RBAC profile is published, you will be able to deploy it on your clusters, but
            no more changes can be made to it.
          </Text>
        </div>
        <DialogActions>
          <Button color="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={publishProfile}>Publish</Button>
        </DialogActions>
      </div>
    </Dialog>
  )

  return (
    <div className={className}>
      {showModal && renderModalContent()}
      <Button className={classes.outlinedButton} textVariant="caption1" onClick={handleOpen}>
        Publish
      </Button>
    </div>
  )
}

export default ProfilePublishDialog
