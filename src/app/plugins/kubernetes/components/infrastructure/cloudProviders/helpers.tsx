import React, { useEffect } from 'react'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import Text from 'core/elements/text'
import { CloudDefaults } from './model'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'

export const getIcon = (classes, loading, regionId, available) =>
  loading || !regionId ? 'circle' : available ? 'check-circle' : 'times-circle'

export const getIconClass = (classes, loading, regionId, available) =>
  loading || !regionId ? classes.circleIcon : available ? classes.checkIcon : classes.timesIcon

export const RegionAvailability = ({ classes, regions, setWizardContext }) => {
  const available = regions?.length
  useEffect(() => {
    if (setWizardContext) {
      setWizardContext(!!available)
    }
  }, [available])

  return (
    <Text variant="body2" className={classes.spaceRight}>
      <FontAwesomeIcon className={getIconClass(classes, false, true, available)} solid>
        {getIcon(classes, false, true, available)}
      </FontAwesomeIcon>
      {available ? 'Regions Available' : 'No Regions Available'}
    </Text>
  )
}

export const awsVerificationCalloutFields = [
  CloudDefaults.AwsRegion,
  CloudDefaults.AwsRoute53Domain,
  CloudDefaults.AwsSshKey,
]

export const azureVerificationCalloutFields = [CloudDefaults.AzureRegion, CloudDefaults.AzureSshKey]

export const calloutFieldLabels = {
  [CloudDefaults.AwsRegion]: 'Default Region',
  [CloudDefaults.AwsRoute53Domain]: 'Default Route53 (Optional)',
  [CloudDefaults.AwsSshKey]: 'Default SSH Key',
  [CloudDefaults.AzureRegion]: 'Default Region',
  [CloudDefaults.AzureSshKey]: 'Default SSH Key',
}

const useStyles = makeStyles((theme: Theme) => ({
  spaceRight: {
    marginRight: theme.spacing(4),
  },
  checkIcon: {
    color: theme.palette.green[500],
    marginRight: theme.spacing(1),
    alignSelf: 'center',
  },
  timesIcon: {
    color: theme.palette.red[500],
    marginRight: theme.spacing(1),
    alignSelf: 'center',
  },
  calloutFields: {
    display: 'grid',
    gridGap: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
  },
  label: {
    display: 'grid',
    gridTemplateColumns: 'min-content 1fr',
  },
  value: {
    marginLeft: theme.spacing(4),
  },
  noneText: {
    color: theme.palette.grey[300],
  },
}))

export const renderVerificationCalloutFields = () => (fields) => {
  const classes = useStyles()
  return (
    <div>
      {Object.entries(fields).map(([key, value]) => {
        const icon = value ? 'check-circle' : 'times-circle'
        const iconClass = value ? 'checkIcon' : 'timesIcon'
        const label = calloutFieldLabels[key]
        return (
          <div key={label} className={classes.calloutFields}>
            <div className={classes.label}>
              <FontAwesomeIcon className={classes[iconClass]} solid>
                {icon}
              </FontAwesomeIcon>
              <Text variant="body2" className={classes.spaceRight}>
                {label}
              </Text>
            </div>
            <Text
              variant="caption1"
              className={clsx(classes.value, value ? '' : classes['noneText'])}
            >
              {value || 'none'}
            </Text>
          </div>
        )
      })}
    </div>
  )
}
