import withFormContext from 'core/components/validatedForm/withFormContext'
import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { noop, emptyObj, emptyArr } from 'utils/fp'
import { pluck, pickAll, prop, assoc, partition, uniq } from 'ramda'
import { FormControl, FormHelperText } from '@material-ui/core'
import ListTable from 'core/components/listTable/ListTable'
import { makeStyles } from '@material-ui/styles'
import useDataLoader from 'core/hooks/useDataLoader'
import { mngmRoleActions } from 'k8s/components/userManagement/roles/actions'
import TenantsPicklist from 'k8s/components/userManagement/common/TenantsPicklist'

const useStyles = makeStyles((theme) => ({
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
const stopPropagation = (e) => {
  e.stopPropagation()
}
const TenantRolesTableField = withFormContext(
  ({
    value = emptyObj,
    id,
    onChange,
    updateFieldValue,
    getCurrentValue,
    hasError,
    errorMessage,
  }) => {
    const [roles, rolesLoading] = useDataLoader(mngmRoleActions.list, { allRoles: true })
    const classes = useStyles()
    const rolesIds = uniq(Object.keys(value))
    // Split between selected and unselected tenants
    const [initialSelectedRows, unselectedRows] = useMemo(
      () => partition(({ id }) => rolesIds.includes(id), roles),
      [roles],
    )
    // Put the selected roles first
    const rows = useMemo(() => [...initialSelectedRows, ...unselectedRows], [initialSelectedRows])
    const [selectedRows, setSelectedRows] = useState(initialSelectedRows)
    useEffect(() => {
      setSelectedRows(initialSelectedRows)
    }, [initialSelectedRows])

    const handleSelectedRowsChange = useCallback(
      (selectedRows) => {
        const selectedRolesIds = pluck('id', selectedRows)
        const rolesObj = getCurrentValue(pickAll(selectedRolesIds))
        onChange(rolesObj)
        setSelectedRows(selectedRows)
      },
      [getCurrentValue, onChange],
    )

    const columns = useMemo(
      () => [
        { id: 'id', label: 'OpenStack ID', display: false, disableSorting: true },
        { id: 'name', label: 'Role', disableSorting: true },
        { id: 'description', label: 'Description', display: false, disableSorting: true },
        {
          id: 'tenants',
          label: 'Tenants',
          disableSorting: true,
          // Create the roles cell component on the-fly to allow access to the
          // current function scope "getCurrentValue" and "updateFieldValue" functions
          Component: ({ row, isSelected }) => {
            const [selectedTenants, setSelectedTenants] = useState(getCurrentValue(prop(row.id)))
            const handleChange = useCallback(
              (tenants) => {
                updateFieldValue(assoc(row.id, tenants))
                setSelectedTenants(tenants)
              },
              [row],
            )
            return (
              <div className={classes.rolesPicklist}>
                <TenantsPicklist
                  name={`role-${row.id}-tenants`}
                  onClick={isSelected ? stopPropagation : noop}
                  value={isSelected ? selectedTenants : emptyArr}
                  onChange={handleChange}
                />
              </div>
            )
          },
        },
      ],
      [getCurrentValue, updateFieldValue],
    )
    return (
      <FormControl id={id} error={hasError}>
        <ListTable
          loading={rolesLoading}
          onSortChange={noop}
          searchTarget="name"
          columns={columns}
          data={rows}
          rowsPerPage={10}
          selectedRows={selectedRows}
          onSelectedRowsChange={handleSelectedRowsChange}
        />
        {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
      </FormControl>
    )
  },
)

export default TenantRolesTableField
