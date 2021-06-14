import React, { useEffect, useMemo } from 'react'
import ListTableField from 'core/components/validatedForm/ListTableField'
import { map, keys, flatten } from 'ramda'
import { ClusterCloudPlatforms } from 'app/constants'

const columns = {
  [ClusterCloudPlatforms.EKS]: [
    { id: 'region', label: 'Region' },
    { id: 'name', label: 'Name' },
    { id: 'id', label: 'ID' },
    { id: 'vpc', label: 'VPC' },
  ],
  [ClusterCloudPlatforms.AKS]: [
    { id: 'region', label: 'Region' },
    { id: 'name', label: 'Name' },
    { id: 'id', label: 'ID' },
    { id: 'vpc', label: 'VPC' },
  ],
  [ClusterCloudPlatforms.GKE]: [
    { id: 'region', label: 'Region' },
    { id: 'name', label: 'Name' },
    { id: 'zone', label: 'Zone' },
    { id: 'id', label: 'ID' },
    { id: 'vpc', label: 'VPC' },
  ],
}

const ReviewClustersTable = ({ selectedClusters, onChange, value, required, stack }) => {
  const allSelectedClusters = useMemo(() => {
    const selectedRegions = keys(selectedClusters)
    const clustersMatrix = map(
      (region) =>
        selectedClusters[region].map((cluster) => ({
          region,
          ...cluster,
        })),
      selectedRegions,
    )
    return flatten(clustersMatrix)
  }, [selectedClusters])

  useEffect(() => {
    // Once clusters are calculated, set that value to the wizard context
    onChange(allSelectedClusters)
  }, [allSelectedClusters])

  return (
    <ListTableField
      id="finalSelectedClusters"
      data={allSelectedClusters}
      loading={false}
      columns={columns[stack]}
      onChange={onChange}
      value={value}
      required={required}
      multiSelection
    />
  )
}

export default ReviewClustersTable
