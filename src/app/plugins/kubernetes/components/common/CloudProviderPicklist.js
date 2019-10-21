import React, { useMemo, forwardRef } from 'react'
import PropTypes from 'prop-types'
import Picklist from 'core/components/Picklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { projectAs } from 'utils/fp'
import { identity, propEq } from 'ramda'
import { cloudProviderActions } from 'k8s/components/infrastructure/cloudProviders/actions'

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const CloudProviderPicklist = forwardRef(({ type, ...rest }, ref) => {
  const [cloudProviders, loading] = useDataLoader(cloudProviderActions.list)
  const options = useMemo(
    () => projectAs(
      { value: 'uuid', label: 'name' },
      cloudProviders.filter(type ? propEq('type', type) : identity)
    ),
    [cloudProviders]
  )

  return <Picklist
    {...rest}
    ref={ref}
    loading={loading}
    options={options}
  />
})

CloudProviderPicklist.propTypes = {
  ...Picklist.propTypes,
  type: PropTypes.string,
}

Picklist.defaultProps = {
  showAll: true,
  showNone: false,
  formField: true,
  variant: 'outlined',
}

export default CloudProviderPicklist
