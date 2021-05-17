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
  errorContainer: {
    border: `1px solid ${theme.palette.grey[300]}`,
    padding: theme.spacing(2, 3),
    marginBottom: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(3),
  },
  flexGrow: {
    flexGrow: 1,
  },
  errorMessage: {
    marginTop: theme.spacing(1.5),
    padding: theme.spacing(2),
    background: theme.palette.grey[100],
  },
}))

const clusterIsNotImported = (cluster) => !cluster.pf9Registered

interface Props {
  cloudProviderId: string
  selectedRegions: string[]
  stack: string
  onChange: any
  value: any
  className: string
  onClustersLoad?: any
}

const ClustersChecklists = ({
  cloudProviderId,
  selectedRegions,
  stack,
  onChange,
  value,
  className,
  onClustersLoad,
}: Props) => {
  const classes = useStyles()
  const [loadingClusters, setLoadingClusters] = useState(false)
  const [details] = useDataLoader(loadCloudProviderDetails, {
    cloudProviderId: cloudProviderId,
  })
  const [allClusters, setAllClusters] = useState([])
  const [loadingByRegion, setLoadingByRegion] = useState({})

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
    if (stack === 'eks') {
      return indexBy(prop('region'), allClusters)
    } else if (stack === 'aks') {
      return indexBy(prop('location'), allClusters)
    }
    return {}
  }, [allClusters, stack])

  // Perhaps EKS and AKS are different enough that they could have separate components?
  // EKS cluster retrieval
  useEffect(() => {
    if (stack !== 'eks') {
      return
    }
    const unpopulatedRegions = selectedRegions.filter((region) => !loadingByRegion[region])
    if (!unpopulatedRegions.length) {
      return
    }
    setLoadingClusters(true)
    const placeholderResult = unpopulatedRegions.reduce(
      (accum, region) => ({ ...accum, [region]: true }),
      loadingByRegion,
    )
    setLoadingByRegion(placeholderResult)
    const retrieveClusters = async () => {
      try {
        const result = await discoverExternalClusters({
          provider: stack,
          cloudProviderId,
          regions: unpopulatedRegions,
        })
        const populatedRegions = allClusters.map((region) => region.region)
        const missingRegions = result.filter((region) => !populatedRegions.includes(region.region))
        setAllClusters([...allClusters, ...missingRegions])
      } finally {
        setLoadingClusters(false)
      }
    }
    retrieveClusters()
  }, [selectedRegions, stack])

  // AKS cluster retrieval
  useEffect(() => {
    if (stack !== 'aks') {
      return
    }
    setLoadingClusters(true)
    const getClusters = async () => {
      try {
        const externalClusters = await discoverExternalClusters({
          provider: stack,
          cloudProviderId: cloudProviderId,
        })
        setAllClusters(externalClusters)
        if (onClustersLoad) {
          onClustersLoad(externalClusters)
        }
      } finally {
        setLoadingClusters(false)
      }
    }
    if (allRegions.length) {
      getClusters()
    }
  }, [allRegions, cloudProviderId, stack])

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
          const regionData = clustersByRegion[region]
          const regionError = regionData?.error
          const regionClusters = regionData?.clusters || []
          if (regionError) {
            return (
              <div className={classes.errorContainer} key={region}>
                <Text variant="body2">
                  Failed to retrieve clusters in the <b>{region}</b> region due to the following
                  error:
                </Text>
                <Text variant="body2" className={classes.errorMessage}>
                  {regionError}
                </Text>
              </div>
            )
          }

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
