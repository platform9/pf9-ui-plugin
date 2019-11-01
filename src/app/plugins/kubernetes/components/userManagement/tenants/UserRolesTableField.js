import withFormContext from 'core/components/validatedForm/withFormContext'
import React, { useState, useCallback, useMemo } from 'react'
import { noop, emptyArr } from 'utils/fp'
import { pluck, pickAll, prop, assoc, partition } from 'ramda'
import RolesPicklist from 'k8s/components/userManagement/tenants/RolesPicklist'
import { FormControl, FormHelperText } from '@material-ui/core'
import ListTable from 'core/components/listTable/ListTable'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  rolesPicklist: {
    margin: theme.spacing(-0.5, 0),
    '& .MuiFormControl-root': {
      margin: 0,
    },
    '& .MuiSelect-select': {
      minWidth: 150,
    },
  },
}))
const stopPropagation = e => {
  e.stopPropagation()
}
const UserRolesTableField = withFormContext(({
  value = emptyArr,
  id,
  users,
  onChange,
  updateFieldValue,
  getCurrentValue,
  hasError,
  errorMessage,
}) => {
  const classes = useStyles()
  const userIds = Object.keys(value)
  // Split between selected and unselected users
  const [initialSelectedRows, unselectedRows] = useMemo(() =>
    partition(({ id }) => userIds.includes(id), users), [])
  // Put the selected users first
  const rows = useMemo(() =>
    [...initialSelectedRows, ...unselectedRows], [initialSelectedRows])

  const [selectedRows, setSelectedRows] = useState(initialSelectedRows)
  const handleSelectedRowsChange = useCallback(selectedRows => {
    const selectedUserIds = pluck('id', selectedRows)
    const usersObj = getCurrentValue(pickAll(selectedUserIds))
    onChange(usersObj)
    setSelectedRows(selectedRows)
  }, [getCurrentValue, onChange])
  const columns = useMemo(() => [
    { id: 'id', label: 'OpenStack ID', display: false, disableSorting: true },
    { id: 'username', label: 'Username', disableSorting: true },
    { id: 'displayname', label: 'Display Name', display: false, disableSorting: true },
    {
      id: 'role',
      label: 'Roles',
      disableSorting: true,
      // Create the roles cell component on the-fly to allow access to the
      // current function scope "getCurrentValue" and "updateFieldValue" functions
      Component: ({ row, isSelected }) => {
        const [currentRole, setCurrentRole] = useState(getCurrentValue(prop(row.id)))
        const handleChange = useCallback(role => {
          updateFieldValue(assoc(row.id, role))
          setCurrentRole(role)
        }, [row])
        return <div className={classes.rolesPicklist}>
          <RolesPicklist
            onClick={isSelected ? stopPropagation : noop}
            selectFirst={isSelected}
            value={isSelected ? currentRole : null}
            onChange={handleChange}
          />
        </div>
      },
    },
  ], [getCurrentValue, updateFieldValue])

  return <FormControl id={id} error={hasError}>
    <ListTable
      onSortChange={noop}
      searchTarget="username"
      columns={columns}
      data={rows}
      rowsPerPage={10}
      selectedRows={selectedRows}
      onSelectedRowsChange={handleSelectedRowsChange} />
    {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
  </FormControl>
})

export default UserRolesTableField
