import withFormContext from 'core/components/validatedForm/withFormContext'
import React, { useState, useCallback, useMemo } from 'react'
import { emptyArr, noop } from 'utils/fp'
import { pluck, pickAll, prop, assoc } from 'ramda'
import RolesPicklist from 'k8s/components/userManagement/RolesPicklist'
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
      minWidth: 120,
    },
  },
}))
const stopPropagation = e => {
  e.stopPropagation()
}
const UserRolesTableField = withFormContext(({ id, users, loading, onChange, getCurrentValue, hasError, errorMessage }) => {
  const classes = useStyles()
  const [selectedRows, setSelectedRows] = useState(emptyArr)
  const handleSelectedRowsChange = useCallback(selectedRows => {
    const selectedUserIds = pluck('id', selectedRows)
    const usersObj = getCurrentValue(pickAll(selectedUserIds))
    onChange(usersObj)
    setSelectedRows(selectedRows)
  }, [getCurrentValue, onChange])
  const columns = useMemo(() => [
    { id: 'id', label: 'OpenStack ID', display: false },
    { id: 'username', label: 'Username' },
    { id: 'displayname', label: 'Display Name' },
    {
      id: 'role',
      label: 'Roles',
      // Create the roles cell component on the-fly to allow access to the
      // current function scope "getCurrentValue" and "onChange" functions
      Component: ({ row, isSelected }) => {
        const [currentRole, setCurrentRole] = useState(getCurrentValue(prop(row.id)))
        const handleChange = useCallback(role => {
          onChange(assoc(row.id, role))
          setCurrentRole(role)
        }, [row])
        return <div className={classes.rolesPicklist}>
          <RolesPicklist
            formField={false}
            disabled={!isSelected}
            onClick={isSelected ? stopPropagation : noop}
            value={currentRole}
            onChange={handleChange}
          />
        </div>
      },
    },
  ], [getCurrentValue, onChange])

  return <FormControl id={id} error={hasError}>
    <ListTable
      searchTarget="username"
      columns={columns}
      data={users}
      rowsPerPage={10}
      loading={loading}
      selectedRows={selectedRows}
      onSelectedRowsChange={handleSelectedRowsChange} />
    {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
  </FormControl>
})

export default UserRolesTableField
