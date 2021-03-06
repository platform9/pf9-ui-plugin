import React, { useMemo } from 'react'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadCloudProviderDetails } from '../../cloudProviders/actions'
import Checkbox from 'core/components/Checkbox'
import { FormControl, FormControlLabel } from '@material-ui/core'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import clsx from 'clsx'

const useStyles = makeStyles<Theme>((theme) => ({
  title: {
    marginBottom: theme.spacing(3),
  },
  nowrap: {
    whiteSpace: 'nowrap',
  },
}))

interface Props {
  cloudProviderId: string
  onChange: any
  value: string[]
  className: string
  clusters?: any
}

const RegionsChecklist = ({ cloudProviderId, onChange, value, className, clusters }: Props) => {
  const classes = useStyles()

  const handleChange = (e, region) => {
    if (onChange) {
      onChange(region)
    }
  }

  const [details] = useDataLoader(loadCloudProviderDetails, {
    cloudProviderId: cloudProviderId,
  })

  const regionCount = useMemo(() => {
    // For now only AKS needs this, uses cluster.location
    if (clusters) {
      console.log(clusters, 'clusters in regions checklist')
      return clusters.reduce((accum, cluster) => {
        return {
          ...accum,
          [cluster.location]: cluster?.clusters?.length,
        }
      }, {})
    }
    return null
  }, [clusters])

  const regions = useMemo(() => {
    const regionList = details
      .map((r) => {
        return r.RegionName
      })
      .sort()
    if (regionCount) {
      // There is no region list for GKE... determine from clusters
      if (!regionList.length) {
        return Object.keys(regionCount).sort()
      }
      // Want to trim down region list for AKS
      return regionList.filter((region) => regionCount[region])
    }
    return regionList
  }, [details, regionCount])

  return (
    <div className={clsx(classes.nowrap, className)}>
      <Text variant="caption1" className={classes.title}>
        Regions
      </Text>
      <FormControl id="regions">
        {regions.map((region) => (
          <FormControlLabel
            key={region}
            label={regionCount ? `${region} (${regionCount[region]})` : region}
            control={
              <Checkbox
                onChange={(e) => handleChange(e, region)}
                checked={value.includes(region)}
              />
            }
          />
        ))}
      </FormControl>
    </div>
  )
}

export default RegionsChecklist
