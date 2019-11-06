import React, { forwardRef, useMemo, useEffect } from 'react'
import Picklist from 'core/components/Picklist'
import useDataLoader from 'core/hooks/useDataLoader'
import PropTypes from 'prop-types'
import { isEmpty, propOr, head } from 'ramda'
import { allKey } from 'app/constants'
import { roleActions, clusterRoleActions } from './actions'

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const RolePicklist = forwardRef(
  ({ clusterId, loading, onChange, selectFirst, showAllRoleTypes, ...rest }, ref) => {
    const [roles, rolesLoading] = useDataLoader(roleActions.list, { clusterId })
    const [clusterRoles, clusterRolesLoading] = useDataLoader(clusterRoleActions.list, { clusterId })

    const options = useMemo(() => {
      // Pass in Role/ClusterRole in value to know which type of role
      // was selected when forming the request body
      const mappedRoles = roles.map(role => ({
        label: `Role: ${role.name}`,
        value: `Role:${role.name}`
      }))
      const mappedClusterRoles = clusterRoles.map(role => ({
        label: `Cluster Role: ${role.name}`,
        value: `ClusterRole:${role.name}`
      }))
      return showAllRoleTypes ? [...mappedRoles, ...mappedClusterRoles] : mappedClusterRoles
    }, [roles, clusterRoles])

    // Select the first item as soon as data is loaded
    useEffect(() => {
      if (!isEmpty(options) && selectFirst) {
        onChange(propOr(allKey, 'value', head(options)))
      }
    }, [options])

    return <Picklist
      {...rest}
      ref={ref}
      onChange={onChange}
      loading={loading || rolesLoading || clusterRolesLoading}
      options={options}
    />
  })

RolePicklist.propTypes = {
  ...Picklist.propTypes,
  name: PropTypes.string,
  label: PropTypes.string,
  selectFirst: PropTypes.bool,
  clusterId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  showAllRoleTypes: PropTypes.bool,
}

RolePicklist.defaultProps = {
  ...Picklist.defaultProps,
  name: 'roleId',
  label: 'Role',
  formField: false,
  selectFirst: true,
}

export default RolePicklist
