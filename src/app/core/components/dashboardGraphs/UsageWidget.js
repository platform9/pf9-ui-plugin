import React from 'react'
import PropTypes from 'prop-types'
import SemiCircle from 'core/components/dashboardGraphs/SemiCircle'
import { Card, CardHeader, CardContent } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  root: {
    boxShadow: 'none',
  },
  header: {
    padding: theme.spacing(1.5, 2),
    backgroundColor: 'rgba(74, 163, 223, .2)',
  },
  content: {
    display: 'flex',
    justifyContent: 'center',
  },
  headerContent: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
  },
  headerImg: {
    maxHeight: 40,
    '& img': {
      maxHeight: 'inherit',
    },
  },
}))

const HeaderContent = ({ title, image }) => {
  const { headerContent, headerImg } = useStyles()
  return <div className={headerContent}>
    <div>
      {title}
    </div>
    {image && <div className={headerImg}>
      {typeof image === 'string' ? <img alt="" src={image} /> : image}
    </div>}
  </div>
}

const UsageWidget = ({ precision, headerImg, stats, title, ...rest }) => {
  const classes = useStyles()
  const { current, max, percent, type, units } = stats

  const curStr = current.toFixed(precision) + units
  const maxStr = max.toFixed(precision) + units
  const percentStr = Math.round(percent)
  return (
    <Card className={classes.root}>
      <CardHeader className={classes.header} title={
        <HeaderContent title={title} image={headerImg} />} />
      <CardContent className={classes.content}>
        <SemiCircle
          percentage={percentStr}
          label={`${curStr} ${type} of ${maxStr}`}
          {...rest}
        />
      </CardContent>
    </Card>
  )
}

UsageWidget.propTypes = {
  headerImg: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  precision: PropTypes.number,
  title: PropTypes.string.isRequired,
  stats: PropTypes.shape({
    current: PropTypes.number,
    max: PropTypes.number,
    percent: PropTypes.number,
    type: PropTypes.string,
    units: PropTypes.string,
  }),
}

UsageWidget.defaultProps = {
  precision: 1,
}

export default UsageWidget
