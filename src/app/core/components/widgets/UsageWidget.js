import React from 'react'
import PropTypes from 'prop-types'
import SemiCircleGraph from 'core/components/graphs/SemiCircleGraph'
import WidgetCard from 'core/components/widgets/WidgetCard'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'

const defaultStats = { current: 0, max: 0, percent: 0 }

const useStyles = makeStyles((theme) => ({
  title: {
    fontWeight: 300,
    textAlign: 'right',
  },
  modifier: {
    fontWeight: 300,
    textAlign: 'left',
  },
  container: {
    marginTop: 20,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridColumnGap: theme.spacing(),
  },
}))

const UsageWidget = ({
  title,
  headerImg = undefined,
  precision = 1,
  units = '',
  usedText = 'used',
  stats = defaultStats,
  ...rest
}) => {
  const classes = useStyles()
  const { current, max, percent } = stats

  const curStr = current.toFixed(precision) + units
  const maxStr = max.toFixed(precision) + units
  const percentStr = Math.round(percent)
  return (
    <WidgetCard title={title} headerImg={headerImg}>
      <SemiCircleGraph
        percentage={percentStr}
        label={
          <div className={classes.container}>
            <Typography variant="subtitle2" className={classes.title}>
              <b>{curStr}</b>
            </Typography>
            <Typography variant="subtitle2" className={classes.modifier}>
              {usedText}
            </Typography>
            <Typography variant="subtitle2" className={classes.title}>
              <b>{maxStr}</b>
            </Typography>
            <Typography variant="subtitle2" className={classes.modifier}>
              available
            </Typography>
          </div>
        }
        {...rest}
      />
    </WidgetCard>
  )
}

UsageWidget.propTypes = {
  ...WidgetCard.propTypes,
  precision: PropTypes.number,
  usedText: PropTypes.string,
  units: PropTypes.string,
  stats: PropTypes.shape({
    current: PropTypes.number,
    max: PropTypes.number,
    percent: PropTypes.number,
  }),
}

export default UsageWidget
