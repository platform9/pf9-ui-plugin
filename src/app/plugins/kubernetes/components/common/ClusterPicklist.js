import React, { useMemo, useEffect, forwardRef } from 'react'
import PropTypes from 'prop-types'
import { isEmpty, propOr, head } from 'ramda'
import Picklist from 'core/components/Picklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { projectAs } from 'utils/fp'
import { allKey } from 'app/constants'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const ClusterPicklist = forwardRef(({
  loading, onChange,
  onlyPrometheusEnabled, onlyMasterNodeClusters, onlyAppCatalogEnabled, onlyHealthyClusters,
  ...rest,
}, ref) => {
  const defaultParams = {
    masterNodeClusters: onlyMasterNodeClusters,
    appCatalogClusters: onlyAppCatalogEnabled,
    prometheusClusters: onlyPrometheusEnabled,
    healthyClusters: onlyHealthyClusters,
  }
  const [clusters, clustersLoading] = useDataLoader(clusterActions.list, defaultParams)
  const options = useMemo(() => projectAs(
    { label: 'name', value: 'uuid' }, clusters,
  ), [clusters])

  // Select the first cluster as soon as clusters are loaded
  useEffect(() => {
    if (!isEmpty(options)) {
      onChange(propOr(allKey, 'value', head(options)))
    }
  }, [options])

  return <Picklist
    {...rest}
    ref={ref}
    onChange={onChange}
    loading={loading || clustersLoading}
    options={options}
  />
})

ClusterPicklist.propTypes = {
  ...Picklist.propTypes,
  name: PropTypes.string,
  label: PropTypes.string,
  formField: PropTypes.bool,
  onlyMasterNodeClusters: PropTypes.bool,
  onlyAppCatalogEnabled: PropTypes.bool,
  onlyPrometheusEnabled: PropTypes.bool,
  onlyHealthyClusters: PropTypes.bool
}

ClusterPicklist.defaultProps = {
  ...Picklist.defaultProps,
  name: 'clusterId',
  label: 'Cluster',
  formField: false,
  onlyMasterNodeClusters: false,
  onlyAppCatalogEnabled: false,
  onlyPrometheusEnabled: false,
  onlyHealthyClusters: false,
}

export default ClusterPicklist
