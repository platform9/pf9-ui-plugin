import React from 'react'
import PropTypes from 'prop-types'
import { ensureFunction } from 'utils/fp'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  root: {
    height: 20,
    display: 'flex',
    width: ({ width }) => width,
    flexFlow: ({ compact }) =>
      compact ? 'column-reverse nowrap' : 'row nowrap',
    alignItems: ({ compact }) =>
      compact ? 'normal' : 'center',
  },
  label: {
    whiteSpace: 'nowrap',
    height: '100%',
    width: ({ compact }) =>
      compact ? '100%' : 100,
    paddingLeft: ({ compact }) =>
      compact ? null : theme.spacing(1),
    ...theme.typography.captionNext,
    letterSpacing: 0.1
  },
  progressContainer: {
    flexGrow: 1,
    height: ({ compact }) =>
      compact ? 3 : '100%',
    minHeight: ({ compact }) =>
      compact ? 3 : '100%',
    backgroundColor: '#D2E1EB',
  },
  '@keyframes stripes': {
    from: {
      backgroundPosition: '40px 0',
    },
    to: {
      backgroundPosition: '0 0',
    },
  },
  progress: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    width: ({ percent }) => `${percent}%`,
    textAlign: 'center',
    textOverflow: 'visible',
    height: '100%',
    backgroundImage:  ({ animated }) => animated ? 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)' : null,
    backgroundSize: '40px 40px',
    backgroundColor: ({ animated }) => animated ? '#4AA3DF' : '#4ADF74',
    animation: '$stripes 2s linear infinite',
    color: '#FFF',
  },
}))

const ProgressBar = props => {
  const { containedPercent, label, percent } = props
  const classes = useStyles(props)
  return (
    <div className={classes.root}>
      <div className={classes.progressContainer}>
        <div
          className={classes.progress}
        >
          {containedPercent ? ensureFunction(label)(percent) : null}
        </div>
      </div>
      {!containedPercent && <div className={classes.label}>
        <span>{ensureFunction(label)(percent)}</span>
      </div>}
    </div>
  )
}

ProgressBar.defaultProps = {
  animated: false,
  containedPercent: false,
  compact: false,
  width: 125,
  label: progress => `${progress}%`,
}

ProgressBar.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  animated: PropTypes.bool,
  // eslint-disable-next-line react/no-unused-prop-types
  compact: PropTypes.bool,
  // eslint-disable-next-line react/no-unused-prop-types
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  containedPercent: PropTypes.bool,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.node]),
  percent: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
}

export default ProgressBar
