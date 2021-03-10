import React, { useMemo, useEffect, forwardRef } from 'react'
import PropTypes from 'prop-types'
import { isEmpty, propOr, head } from 'ramda'
import Picklist from 'core/components/Picklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { projectAs } from 'utils/fp'
import { allKey } from 'app/constants'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import { importedClusterActions } from '../infrastructure/importedClusters/actions'

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const ClusterPicklist = forwardRef(
  (
    {
      loading,
      onChange,
      selectFirst,
      onlyPrometheusEnabled,
      onlyMasterNodeClusters,
      onlyAppCatalogEnabled,
      onlyHealthyClusters,
      value,
      ...rest
    },
    ref,
  ) => {
    const defaultParams = {
      masterNodeClusters: onlyMasterNodeClusters,
      appCatalogClusters: onlyAppCatalogEnabled,
      prometheusClusters: onlyPrometheusEnabled,
      healthyClusters: onlyHealthyClusters,
    }
    const [clusters, clustersLoading] = useDataLoader(clusterActions.list, defaultParams)
    const [importedClusters, importedClustersLoading] = useDataLoader(importedClusterActions.list)
    const options = useMemo(() => {
      // Sorting on these may be a bit weird, ask chris what's preferred
      return [
        ...projectAs({ label: 'name', value: 'uuid' }, clusters),
        ...projectAs({ label: 'name', value: 'uuid' }, importedClusters),
      ]
    }, [clusters, importedClusters])

    // Select the first cluster as soon as clusters are loaded
    useEffect(() => {
      if (!isEmpty(options) && selectFirst && !value) {
        onChange(propOr(allKey, 'value', head(options)))
      }
    }, [options])

    return (
      <Picklist
        {...rest}
        ref={ref}
        onChange={onChange}
        loading={loading || clustersLoading}
        options={options}
        value={value}
      />
    )
  },
)

ClusterPicklist.propTypes = {
  ...Picklist.propTypes,
  name: PropTypes.string,
  label: PropTypes.string,
  formField: PropTypes.bool,
  onlyMasterNodeClusters: PropTypes.bool,
  onlyAppCatalogEnabled: PropTypes.bool,
  onlyPrometheusEnabled: PropTypes.bool,
  onlyHealthyClusters: PropTypes.bool,
  selectFirst: PropTypes.bool,
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
  selectFirst: true,
}

export default ClusterPicklist
