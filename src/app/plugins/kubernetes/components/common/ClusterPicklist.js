import React, { useMemo, useEffect, forwardRef } from 'react'
import PropTypes from 'prop-types'
import { isEmpty, propOr, head, omit } from 'ramda'
import Picklist from 'core/components/Picklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { projectAs } from 'utils/fp'
import { clusterActions } from '../infrastructure/actions'
import { allKey } from 'app/constants'

const ClusterPicklist = forwardRef(({
  loading, onChange, value, onlyPrometheusEnabled, onlyMasterNodeClusters,
  showNone, ...rest,
}, ref) => {
  const defaultParams = {
    masterNodeClusters: onlyMasterNodeClusters,
    prometheusNodeClusters: onlyPrometheusEnabled,
  }
  const [clusters, clustersLoading] = useDataLoader(clusterActions.list, defaultParams)
  const options = useMemo(() =>
    projectAs({ label: 'name', value: 'uuid' })(clusters),
  [clusters, onlyMasterNodeClusters, onlyPrometheusEnabled])

  // Select the first cluster as soon as clusters are loaded
  useEffect(() => {
    if (!isEmpty(options)) {
      onChange(propOr(allKey, 'value', head(options)))
    }
  }, [options])

  return <Picklist
    {...rest}
    ref={ref}
    showNone={showNone}
    onChange={onChange}
    disabled={isEmpty(options) && !showNone}
    value={value || propOr(allKey, 'value', head(options))}
    loading={loading || clustersLoading}
    options={options}
  />
})

ClusterPicklist.propTypes = {
  ...omit(['options'], Picklist.propTypes),
  name: PropTypes.string,
  label: PropTypes.string,
  formField: PropTypes.bool,
  onlyMasterNodeClusters: PropTypes.bool,
  onlyPrometheusEnabled: PropTypes.bool,
}

ClusterPicklist.defaultProps = {
  ...Picklist.defaultProps,
  name: 'clusterId',
  label: 'Current Cluster',
  formField: false,
  onlyMasterNodeClusters: true,
  onlyPrometheusEnabled: false,
}

export default ClusterPicklist
