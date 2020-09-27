import React, { FC } from 'react'
import { ensureFunction } from 'utils/fp'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import Text from 'core/elements/text'

type LabelRenderProp = (value: string) => string

interface Props {
  percent: number | string
  animated?: boolean
  compact?: boolean
  width?: string | number
  height?: string | number
  containedPercent?: boolean
  label?: string | JSX.Element | LabelRenderProp
  variant?: 'progress' | 'health'
  color?: 'error' | 'success' | 'primary'
}

const useStyles = makeStyles<Theme, Props>((theme) => ({
  root: {
    height: ({ height }) => height,
    display: 'flex',
    width: ({ width }) => width,
    flexFlow: ({ compact }) => (compact ? 'column-reverse nowrap' : 'row nowrap'),
    alignItems: ({ compact }) => (compact ? 'normal' : 'center'),
  },
  label: {
    whiteSpace: 'nowrap',
    height: '100%',
    width: ({ compact }) => (compact ? '100%' : 40),
    paddingLeft: ({ compact }) => (compact ? null : theme.spacing(1)),
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: '12px',
    letterSpacing: 0.1,
  },
  progressContainer: {
    flexGrow: 1,
    height: ({ compact }) => (compact ? 3 : '100%'),
    minHeight: ({ compact }) => (compact ? 3 : '100%'),
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
    fontSize: '12px',
    alignItems: 'center',
    justifyContent: 'center',
    width: ({ percent }) => `${percent}%`,
    textAlign: 'center',
    textOverflow: 'visible',
    height: '100%',
    backgroundImage: ({ animated }) =>
      animated
        ? 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)'
        : null,
    backgroundSize: '40px 40px',
    backgroundColor: ({ animated, percent, variant, color }) => {
      if (color) {
        return theme.palette[color].main
      }
      if (animated) return theme.palette.primary.main
      if (variant === 'health') {
        if (percent >= 90) return theme.components.error.main
        if (percent >= 80) return theme.components.warning.main
      }
      return theme.components.success.main
    },
    animation: '$stripes 2s linear infinite',
    color: '#FFF',
  },
}))

const ProgressBar: FC<Props> = ({
  percent,
  animated = false,
  containedPercent = false,
  compact = false,
  width = 145,
  height = 15,
  label = (progress) => `${progress}%`,
  variant = 'progress',
  color = undefined,
}) => {
  const classes = useStyles({ percent, animated, compact, width, height, variant, color })
  return (
    <div className={classes.root}>
      <div className={classes.progressContainer}>
        <div className={classes.progress}>
          <Text variant="body2">{containedPercent ? ensureFunction(label)(percent) : null}</Text>
        </div>
      </div>
      {!containedPercent && (
        <div className={classes.label}>
          <Text variant="body2">{ensureFunction(label)(percent)}</Text>
        </div>
      )}
    </div>
  )
}

export default ProgressBar
