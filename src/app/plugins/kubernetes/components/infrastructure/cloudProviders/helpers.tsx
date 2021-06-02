import React from 'react'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import Text from 'core/elements/text'
import { CloudDefaults, CloudProviders } from './model'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import { objSwitchCase } from 'utils/fp'
const objSwitchCaseAny: any = objSwitchCase // types on forward ref .js file dont work well.

export const getIcon = (classes, loading, regionId, available) =>
  loading || !regionId ? 'circle' : available ? 'check-circle' : 'times-circle'

export const getIconClass = (classes, loading, regionId, available) =>
  loading || !regionId ? classes.circleIcon : available ? classes.checkIcon : classes.timesIcon

export const RegionAvailability = ({ classes, regions }) => {
  const available = regions?.length

  return (
    <Text variant="body2" className={classes.spaceRight}>
      <FontAwesomeIcon className={getIconClass(classes, false, true, available)} solid>
        {getIcon(classes, false, true, available)}
      </FontAwesomeIcon>
      {available ? 'Regions Available' : 'No Regions Available'}
    </Text>
  )
}

export const cloudVerificationCalloutFields = (cloudProvider: CloudProviders) => {
  if (!cloudProvider) return []
  return objSwitchCaseAny({
    [CloudProviders.Aws]: [CloudDefaults.Region, CloudDefaults.DomainLabel, CloudDefaults.SshKey],
    [CloudProviders.Azure]: [CloudDefaults.RegionLabel, CloudDefaults.SshKey],
  })(cloudProvider)
}

const cloudVerificationCalloutFieldLabels = {
  [CloudDefaults.Region]: 'Default Region',
  [CloudDefaults.RegionLabel]: 'Default Region',
  [CloudDefaults.Domain]: 'Default Route53 (Optional)',
  [CloudDefaults.DomainLabel]: 'Default Route53 (Optional)',
  [CloudDefaults.SshKey]: 'Default SSH Key',
  [CloudDefaults.SshKeyLabel]: 'Default SSH Key',
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
    display: 'block',
    overflow: 'auto',
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
        const label = cloudVerificationCalloutFieldLabels[key]
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
