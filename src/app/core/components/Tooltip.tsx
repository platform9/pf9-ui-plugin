import React, { FC } from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import clsx from 'clsx'

export const Tooltip: FC<{ message: string | React.ReactNode }> = ({ message, children }) => {
  const classes = useStyles()
  return (
    <div className={classes.container}>
      {children}
      <div className={classes.mouseTarget}>
        <div className={clsx('tooltip', classes.tooltip)}>{message}</div>
      </div>
    </div>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  tooltip: {
    visibility: 'hidden',
    opacity: 0,
    pointerEvents: 'none',

    position: 'absolute',
    zIndex: 1,
    top: '100%',
    left: '50%',
    transform: 'translate(-50%, 0%)',

    display: 'grid',
    gridTemplateColumns: 'max-content',

    background: 'rgba(97, 97, 97, 0.9)', // same as material ui tooltip color
    borderRadius: 5,
    padding: theme.spacing(),
    transition: 'all .2s ease',

    color: theme.palette.common.white,

    '& *:not(a)': {
      color: theme.palette.common.white,
    },
    '& a': {
      color: theme.palette.primary.light,
    },
  },
  mouseTarget: {
    position: 'absolute',
    top: -6,
    left: -6,
    padding: 6, // padd the mouse target so its easier to hover on the tooltip if desired
    width: '100%',
    height: '100%',

    '&:hover .tooltip': {
      pointerEvents: 'inherit',
      visibility: 'visible',
      opacity: 1,
    },
  },
  container: {
    position: 'relative',
  },
}))
