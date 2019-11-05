import React, { useMemo, useEffect, forwardRef } from 'react'
import PropTypes from 'prop-types'
import { isEmpty, propOr, head } from 'ramda'
import Picklist from 'core/components/Picklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { projectAs } from 'utils/fp'
import { allKey } from 'app/constants'
import { mngmRoleActions } from 'k8s/components/userManagement/roles/actions'

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const RolesPicklist = forwardRef(({
  allRoles, id,
  loading, onChange, value, selectFirst, disabled,
  ...rest
}, ref) => {
  const [roles, rolesLoading] = useDataLoader(mngmRoleActions.list, { allRoles })
  const options = useMemo(() => projectAs(
    { label: 'name', value: 'id' }, roles,
  ), [roles])

  // Select the first role as soon as roles are loaded
  useEffect(() => {
    if (selectFirst && !(disabled || value || isEmpty(options))) {
      onChange(propOr(allKey, 'value', head(options)))
    }
  }, [options, disabled, selectFirst])

  return <Picklist
    {...rest}
    disabled={disabled}
    value={value}
    ref={ref}
    onChange={onChange}
    loading={loading || rolesLoading}
    options={options}
  />
})

RolesPicklist.propTypes = {
  ...Picklist.propTypes,
  name: PropTypes.string,
  label: PropTypes.string,
  formField: PropTypes.bool,
  selectFirst: PropTypes.bool,
  allRoles: PropTypes.bool,
}

RolesPicklist.defaultProps = {
  ...Picklist.defaultProps,
  name: 'roleId',
  label: 'Role',
  formField: false,
  showAll: false,
  showNone: false,
  selectFirst: false,
  allRoles: true,
}

export default RolesPicklist
