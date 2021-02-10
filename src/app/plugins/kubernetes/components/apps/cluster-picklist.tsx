import React, { useMemo, useEffect } from 'react'
import { isEmpty, propOr, head } from 'ramda'
import PicklistDefault from 'core/components/Picklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { allKey } from 'app/constants'
import { repositoryActions } from '../repositories/actions'
import { clusterActions } from '../infrastructure/clusters/actions'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.

const ClusterPicklist = ({ onChange, selectFirst, value, repository, ...rest }) => {
  const [repositories, loadingRepositories] = useDataLoader(repositoryActions.list)
  const [clusters, loadingClusters] = useDataLoader(clusterActions.list)

  // Find the repository and get its list of clusterIds
  const clusterIds = useMemo(
    () => repositories.find((repo) => repo.name === repository)?.clusters || [],
    [repositories, repository],
  )

  // Map each clusterId to a cluster to get its cluster name
  const options = clusterIds.map((id) => {
    const cluster = clusters.find((cl) => cl.uuid === id)
    return {
      label: cluster.name,
      value: id,
    }
  })

  // Select the first cluster Ids as soon as clusters Ids are loaded
  useEffect(() => {
    if (!isEmpty(options) && selectFirst && !value) {
      onChange(propOr(allKey, 'value', head(options)))
    }
  }, [options])

  return (
    <Picklist
      {...rest}
      onChange={onChange}
      loading={loadingRepositories || loadingClusters}
      options={options}
      value={value}
    />
  )
}

export default ClusterPicklist
