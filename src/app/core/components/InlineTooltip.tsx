import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import FontAwesomeIcon from './FontAwesomeIcon'
import clsx from 'clsx'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
  },
  icon: {
    color: theme.palette.blue[500],
  },
  text: {
    flexGrow: 1,
    marginLeft: theme.spacing(0.5),
  },
}))

const InlineTooltip = ({ children, className = '', iconSize = 'lg' }) => {
  const classes = useStyles({})

  return (
    <div className={clsx(classes.root, className)}>
      <FontAwesomeIcon className={classes.icon} size={iconSize}>
        info-circle
      </FontAwesomeIcon>
      <div className={classes.text}>{children}</div>
    </div>
  )
}

export default InlineTooltip
