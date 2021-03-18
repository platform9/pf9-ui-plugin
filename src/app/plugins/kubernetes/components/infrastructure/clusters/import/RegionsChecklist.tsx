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

const RegionsChecklist = ({ cloudProviderId, onChange, value, className }) => {
  const classes = useStyles()

  const handleChange = (e, region) => {
    if (onChange) {
      onChange(region)
    }
  }

  const [details] = useDataLoader(loadCloudProviderDetails, {
    cloudProviderId: cloudProviderId,
  })

  const regions = useMemo(() => {
    return details
      .map((r) => {
        return r.RegionName
      })
      .sort()
  }, [details])

  return (
    <div className={clsx(classes.nowrap, className)}>
      <Text variant="caption1" className={classes.title}>
        Regions
      </Text>
      <FormControl id="regions">
        {regions.map((region) => (
          <FormControlLabel
            key={region}
            label={region}
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
