import React, { useCallback, useMemo } from 'react'
import ConfirmationDialog from 'core/components/ConfirmationDialog'
import Text from 'core/elements/text'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { mngmUserActions, mngmUserRoleAssignmentsLoader } from './actions'
import useDataLoader from 'core/hooks/useDataLoader'
import { pathStr } from 'utils/fp'

const EnableDisableUserDialog = ({ rows: [user], onClose }) => {
  const action = user.enabled ? 'Disable' : 'Enable'
  const [update, updating] = useDataUpdater(mngmUserActions.update, onClose)
  const [roleAssignments] = useDataLoader(mngmUserRoleAssignmentsLoader, {
    userId: user.id,
  })
  const userRoleAssignments = useMemo(
    () =>
      roleAssignments.reduce(
        (acc, roleAssignment) => ({
          ...acc,
          [pathStr('scope.project.id', roleAssignment)]: pathStr('role.id', roleAssignment),
        }),
        {},
      ),
    [user, roleAssignments],
  )

  const handleSubmit = useCallback(
    () =>
      update({
        id: user.id,
        username: user.username,
        displayname: user.displayname,
        enabled: !user.enabled,
        roleAssignments: userRoleAssignments,
      }),
    [user],
  )
  return (
    <ConfirmationDialog
      title={`${action} User`}
      text={
        <Text component="span">
          {action} user {user.username}?
        </Text>
      }
      open
      onCancel={onClose}
      onConfirm={handleSubmit}
      loading={updating}
    />
  )
}

export default EnableDisableUserDialog
