import React, { useMemo, useEffect, forwardRef, useState } from 'react'
import PropTypes from 'prop-types'
import { isEmpty, propOr, head, project, path } from 'ramda'
import Picklist from 'core/components/Picklist'
import { projectAs } from 'utils/fp'
import { allKey } from 'app/constants'
import { getAllClusters } from 'k8s/components/infrastructure/clusters/actions'
import { allClustersSelector } from '../infrastructure/clusters/selectors'
import { useSelector } from 'react-redux'
import { cacheStoreKey, loadingStoreKey } from 'core/caching/cacheReducers'
import { ActionDataKeys } from 'k8s/DataKeys'

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
      filterFn,
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

    const selector = allClustersSelector()
    const allClusters = useSelector((state) => selector(state, defaultParams))

    const clustersLoading = useSelector(
      path([cacheStoreKey, loadingStoreKey, ActionDataKeys.Clusters]),
    )
    const importedClustersLoading = useSelector(
      path([cacheStoreKey, loadingStoreKey, ActionDataKeys.ImportedClusters]),
    )
    const allClustersLoading = clustersLoading && importedClustersLoading

    useEffect(() => {
      getAllClusters()
    }, [])

    const filteredClusters = useMemo(() => (filterFn ? filterFn(allClusters) : allClusters), [
      allClusters,
    ])

    const options = useMemo(() => {
      return [...projectAs({ label: 'name', value: 'uuid' }, filteredClusters)]
    }, [filteredClusters])

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
        loading={loading || allClustersLoading}
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
  filterFn: PropTypes.func,
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
