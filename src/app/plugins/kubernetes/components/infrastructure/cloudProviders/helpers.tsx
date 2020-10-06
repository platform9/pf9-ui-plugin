import React from 'react'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import Text from 'core/elements/text'

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
