import React from 'react'
import { Theme, Tooltip } from '@material-ui/core'
import FontAwesomeIcon from '../FontAwesomeIcon'
import { makeStyles } from '@material-ui/styles'
import clsx from 'clsx'

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    cursor: 'pointer',
    fontWeight: 300,
    marginLeft: 25,
    color: theme.palette.grey[700],
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
}))

interface Props {
  className?: any
  onRefresh: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
}

const RefreshButton = ({ className, onRefresh }: Props) => {
  const classes = useStyles()
  return (
    <Tooltip title="Refresh list">
      <FontAwesomeIcon
        className={clsx(classes.button, className)}
        solid
        size="lg"
        aria-label="Refresh list"
        onClick={onRefresh}
      >
        sync
      </FontAwesomeIcon>
    </Tooltip>
  )
}

export default RefreshButton
