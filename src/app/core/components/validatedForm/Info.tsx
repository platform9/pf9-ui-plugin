import React, { useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Divider } from '@material-ui/core'
import Theme from 'core/themes/model'
import clsx from 'clsx'
import FontAwesomeIcon from '../FontAwesomeIcon'

const useStyles = makeStyles<Theme, { error: boolean }>((theme: Theme) => ({
  container: {
    background: theme.palette.grey[100],
    padding: theme.spacing(3),
    border: ({ error }) => `1px solid ${error ? theme.palette.error.main : 'transparent'}`,
    borderRadius: 4,
    ...theme.typography.body2,
    color: theme.palette.grey[700],
  },
  minimizedContainer: {
    background: theme.palette.grey['100'],
    padding: theme.spacing(1.5, 3),
  },
  header: {
    fontSize: 16,
    color: theme.palette.blue[500],
    fontWeight: 600,
    display: 'flex',
  },
  title: {
    flexGrow: 1,
    alignSelf: 'center',
  },
  button: {
    flexGrow: 0,
    backgroundColor: theme.palette.blue[500],
    height: '24px',
    width: '24px',
    borderRadius: '50%',
    display: 'flex',
    cursor: 'pointer',
  },
  icon: {
    color: theme.palette.common.white,
    alignSelf: 'center',
  },
  divider: {
    backgroundColor: theme.palette.blue[500],
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
  },
}))

interface Props {
  children: any
  error?: boolean
  className?: string
  title?: string
  expanded?: boolean // Show expanded by default or not
}

const Info = ({
  children,
  error = false,
  className = undefined,
  title = '',
  expanded = true,
}: Props) => {
  const classes = useStyles({ error })
  const [isExpanded, setExpanded] = useState(expanded)
  const isMinimized = title && !isExpanded

  return (
    <div className={clsx(isMinimized ? classes.minimizedContainer : classes.container, className)}>
      {title && (
        <div className={classes.header}>
          <span className={classes.title}>{title}</span>
          <div
            className={classes.button}
            onClick={() => {
              setExpanded(!isExpanded)
            }}
          >
            {isExpanded ? (
              <FontAwesomeIcon className={classes.icon}>angle-up</FontAwesomeIcon>
            ) : (
              <FontAwesomeIcon className={classes.icon}>angle-down</FontAwesomeIcon>
            )}
          </div>
        </div>
      )}
      {title && isExpanded && <Divider className={classes.divider} />}
      {(!title || isExpanded) && children}
    </div>
  )
}

export default Info
