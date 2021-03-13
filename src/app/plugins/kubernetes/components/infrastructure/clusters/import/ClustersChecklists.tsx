import React, { useEffect, useMemo, useState } from 'react'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadCloudProviderDetails } from '../../cloudProviders/actions'
import { discoverExternalClusters } from './actions'
import { indexBy, prop } from 'ramda'
import ListTableField from 'core/components/validatedForm/ListTableField'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'

const renderImported = (_, { pf9Registered }) =>
  pf9Registered ? <Text variant="caption2">Imported</Text> : null

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'id', label: 'ID' },
  { id: 'vpc', label: 'VPC' },
  { id: 'imported', label: '', render: renderImported },
]

const useStyles = makeStyles<Theme>((theme) => ({
  listContainer: {
    border: `1px solid ${theme.palette.grey[300]}`,
    padding: theme.spacing(0, 3),
    marginBottom: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(3),
  },
  flexGrow: {
    flexGrow: 1,
  },
}))

const clusterIsNotImported = (cluster) => !cluster.pf9Registered

const ClustersChecklists = ({ cloudProviderId, selectedRegions, onChange, value, className }) => {
  const classes = useStyles()
  const [loadingClusters, setLoadingClusters] = useState(true)
  const [details] = useDataLoader(loadCloudProviderDetails, {
    cloudProviderId: cloudProviderId,
  })
  const [allClusters, setAllClusters] = useState([])

  const allRegions = useMemo(() => {
    return details
      .map((r) => {
        return r.RegionName
      })
      .sort()
  }, [details])

  const clustersByRegion = useMemo(() => {
    if (!allClusters.length) {
      return {}
    }
    return indexBy(prop('region'), allClusters)
  }, [allClusters, selectedRegions])

  useEffect(() => {
    const getClusters = async () => {
      const externalClusters = await discoverExternalClusters({
        provider: 'eks',
        cloudProviderId: cloudProviderId,
        regions: allRegions,
      })
      setAllClusters(externalClusters)
      setLoadingClusters(false)
    }
    if (allRegions.length) {
      getClusters()
    }
  }, [allRegions, cloudProviderId])

  return (
    <div className={className}>
      <Text variant="caption1" className={classes.title}>
        Clusters
      </Text>
      {loadingClusters && (
        <Text variant="body2">
          <FontAwesomeIcon spin>sync</FontAwesomeIcon> Loading clusters...
        </Text>
      )}
      {!loadingClusters && !selectedRegions.length && (
        <Text variant="body2">
          Select region(s) to the left to see available clusters in the region.
        </Text>
      )}
      {!loadingClusters &&
        selectedRegions.map((region) => {
          const regionClusters = clustersByRegion[region]?.clusters || []
          return (
            <div className={classes.listContainer} key={region}>
              <ListTableField
                id={region}
                data={regionClusters}
                loading={false}
                columns={columns}
                onChange={(value) => onChange(value, region)}
                value={value[region]}
                checkboxCond={clusterIsNotImported}
                extraToolbarContent={
                  <Text className={classes.flexGrow} variant="body1">
                    {region}
                  </Text>
                }
                multiSelection
              />
            </div>
          )
        })}
    </div>
  )
}

export default ClustersChecklists
