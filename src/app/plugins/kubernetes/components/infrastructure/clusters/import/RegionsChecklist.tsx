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
  console.log(clusters, 'clusters')

  const handleChange = (e, region) => {
    if (onChange) {
      onChange(region)
    }
  }

  const [details] = useDataLoader(loadCloudProviderDetails, {
    cloudProviderId: cloudProviderId,
  })

  const regionCount = useMemo(() => {
    // Currently only AKS passes this, assume location as prop to index by
    if (clusters) {
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
      return regionList.filter((region) => regionCount[region])
    }
    return regionList
  }, [details, regionCount])

  console.log(regionCount, 'regionCount')
  console.log(regions)

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
