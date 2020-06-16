import React, { useMemo, forwardRef } from 'react'
import PropTypes from 'prop-types'
import Picklist from 'core/components/Picklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { projectAs } from 'utils/fp'
import { mngmTenantActions } from 'k8s/components/userManagement/tenants/actions'

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const TenantsPicklist = forwardRef(
  ({ allRoles, id, loading, onChange, value, disabled, ...rest }, ref) => {
    const [tenants, tenantsLoading] = useDataLoader(mngmTenantActions.list)
    const options = useMemo(() => projectAs({ label: 'name', value: 'id' }, tenants), [tenants])

    return (
      <Picklist
        {...rest}
        multiple
        disabled={disabled}
        value={value}
        ref={ref}
        onChange={onChange}
        loading={loading || tenantsLoading}
        options={options}
      />
    )
  },
)

TenantsPicklist.propTypes = {
  ...Picklist.propTypes,
  name: PropTypes.string,
  label: PropTypes.string,
  formField: PropTypes.bool,
  allRoles: PropTypes.bool,
}

TenantsPicklist.defaultProps = {
  ...Picklist.defaultProps,
  name: 'tenants',
  label: 'Tenants',
  formField: false,
  showAll: false,
  showNone: false,
}

export default TenantsPicklist
