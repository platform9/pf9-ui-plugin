import React, { useMemo, useEffect, forwardRef } from 'react'
import PropTypes from 'prop-types'
import { isEmpty, propOr, head } from 'ramda'
import Picklist from 'core/components/Picklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { projectAs } from 'utils/fp'
import { allKey } from 'app/constants'
import { mngmRoleActions } from 'k8s/components/userManagement/actions'

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const RolesPicklist = forwardRef(({ loading, onChange, selectFirst, ...rest }, ref) => {
  const [roles, rolesLoading] = useDataLoader(mngmRoleActions.list)
  const options = useMemo(() => projectAs(
    { label: 'name', value: 'id' }, roles,
  ), [roles])

  // Select the first role as soon as roles are loaded
  useEffect(() => {
    if (!isEmpty(options) && selectFirst) {
      onChange(propOr(allKey, 'value', head(options)))
    }
  }, [options])

  return <Picklist
    {...rest}
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
}

RolesPicklist.defaultProps = {
  ...Picklist.defaultProps,
  name: 'roleId',
  label: 'Role',
  formField: false,
  showAll: false,
  selectFirst: true
}

export default RolesPicklist
