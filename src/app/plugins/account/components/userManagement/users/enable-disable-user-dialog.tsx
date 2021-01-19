import React, { useCallback } from 'react'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { mngmUserActions, mngmUserRoleAssignmentsLoader } from './actions'
import useDataLoader from 'core/hooks/useDataLoader'
import { pathStr } from 'utils/fp'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core'
import Progress from 'core/components/progress/Progress'
import SubmitButton from 'core/components/buttons/SubmitButton'
import CancelButton from 'core/components/buttons/CancelButton'

const EnableDisableUserDialog = ({ rows: [user], onClose }) => {
  const action = user.enabled ? 'Disable' : 'Enable'
  const [update, updating] = useDataUpdater(mngmUserActions.update, onClose)
  const [roleAssignments, loading] = useDataLoader(mngmUserRoleAssignmentsLoader, {
    userId: user.id,
  })

  const handleSubmit = useCallback(() => {
    const userRoleAssignments = roleAssignments.reduce(
      (acc, roleAssignment) => ({
        ...acc,
        [pathStr('scope.project.id', roleAssignment)]: pathStr('role.id', roleAssignment),
      }),
      {},
    )

    update({
      id: user.id,
      enabled: !user.enabled,
      roleAssignments: userRoleAssignments,
    })
  }, [user, roleAssignments])

  return (
    <Dialog open onClose={onClose}>
      <Progress loading={loading || updating} minHeight={100} maxHeight={100}>
        <DialogTitle>{action} User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {action} user {user.username}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <CancelButton onClick={onClose} />
          <SubmitButton onClick={handleSubmit} />
        </DialogActions>
      </Progress>
    </Dialog>
  )
}

export default EnableDisableUserDialog
