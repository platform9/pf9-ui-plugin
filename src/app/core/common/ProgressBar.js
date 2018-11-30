import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { ensureFunction } from 'core/fp'
import { withStyles } from '@material-ui/styles'

const styles = theme => ({
  root: {
    height: 20,
    display: 'flex',
    flexFlow: ({ compact }) =>
      compact ? 'column-reverse nowrap' : 'row nowrap',
    alignItems: ({ compact }) =>
      compact ? 'normal' : 'center',
  },
  label: {
    height: '100%',
    width: ({ compact }) =>
      compact ? '100%' : 100,
    paddingLeft: ({ compact }) =>
      compact ? null : theme.spacing.unit,
    ...theme.typography.captionNext
  },
  progressContainer: {
    flexGrow: 1,
    height: ({ compact }) =>
      compact ? 3 : '100%',
    backgroundColor: '#D2E1EB',
  },
  progress: {
    height: '100%',
    backgroundColor: '#4ADF74',
  }
})

@withStyles(styles)
class ProgressBar extends PureComponent {
  render () {
    const { label, percent, classes, width } = this.props
    return (
      <div className={classes.root} style={{ width }}>
        <div className={classes.progressContainer}>
          <div
            style={{ width: `${percent}%` }}
            className={classes.progress}
          />
        </div>
        <div className={classes.label}>
          <span>{ensureFunction(label)(percent)}</span>
        </div>
      </div>
    )
  }
}

ProgressBar.defaultProps = {
  compact: false,
  width: 250,
  label: progress => `${progress}%`
}

ProgressBar.propTypes = {
  compact: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  percent: PropTypes.number.isRequired,
}

export default ProgressBar
