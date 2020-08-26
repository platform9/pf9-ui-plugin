import withFormContext from 'core/components/validatedForm/withFormContext'
import React, { useState, useCallback, useMemo } from 'react'
import { noop, emptyArr } from 'utils/fp'
import { pluck, pickAll, prop, assoc, partition, differenceWith } from 'ramda'
import RolesPicklist from 'k8s/components/userManagement/common/RolesPicklist'
import { FormControl, FormHelperText } from '@material-ui/core'
import ListTable from 'core/components/listTable/ListTable'
import { makeStyles } from '@material-ui/styles'

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
  root: {
    display: 'block',
  },
}))
const stopPropagation = (e) => {
  e.stopPropagation()
}
const TenantRolesTableField = withFormContext(
  ({
    value = emptyArr,
    id,
    tenants,
    onChange,
    updateFieldValue,
    getCurrentValue,
    hasError,
    errorMessage,
  }) => {
    const classes = useStyles()
    const tenantIds = Object.keys(value)
    // Split between selected and unselected tenants
    const [initialSelectedRows, unselectedRows] = useMemo(
      () => partition(({ id }) => tenantIds.includes(id), tenants),
      [],
    )
    // Put the selected tenants first
    const rows = useMemo(() => [...initialSelectedRows, ...unselectedRows], [initialSelectedRows])
    const [selectedRows, setSelectedRows] = useState(initialSelectedRows)
    const handleSelectedRowsChange = useCallback(
      (newSelectedRows, tmp) => {
        const diff = differenceWith((rows, compareRows) => rows.id === compareRows.id)
        const mismatchs = diff(selectedRows, newSelectedRows)
        const serviceMismatch = mismatchs.find((mismatch) => mismatch.name === 'service')
        if (serviceMismatch && serviceMismatch.users.length < 2) {
          return false
        }
        const selectedTenantIds = pluck('id', newSelectedRows)
        const tenantsObj = getCurrentValue(pickAll(selectedTenantIds))
        onChange(tenantsObj)
        setSelectedRows(newSelectedRows)
      },
      [getCurrentValue, onChange, selectedRows],
    )

    const columns = useMemo(
      () => [
        { id: 'id', label: 'OpenStack ID', display: false, disableSorting: true },
        { id: 'name', label: 'Tenant', disableSorting: true },
        { id: 'description', label: 'Description', display: false, disableSorting: true },
        {
          id: 'role',
          label: 'Roles',
          disableSorting: true,
          // Create the roles cell component on the-fly to allow access to the
          // current function scope "getCurrentValue" and "updateFieldValue" functions
          Component: ({ row, isSelected }) => {
            const [currentRole, setCurrentRole] = useState(getCurrentValue(prop(row.id)))
            const handleChange = useCallback(
              (role) => {
                updateFieldValue(assoc(row.id, role))
                setCurrentRole(role)
              },
              [row],
            )
            return (
              <div className={classes.rolesPicklist}>
                <RolesPicklist
                  name={`tenant-${row.id}-roleId`}
                  onClick={isSelected ? stopPropagation : noop}
                  selectFirst={isSelected}
                  value={isSelected ? currentRole : null}
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
      <FormControl id={id} error={hasError} className={classes.root}>
        <ListTable
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
