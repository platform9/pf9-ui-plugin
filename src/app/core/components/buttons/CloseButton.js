import React from 'react'
import PropTypes from 'prop-types'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/styles'
import { Tooltip } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  icon: {
    color: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.primary.dark,
    },
  },
}))

const CloseButton = (props) => {
  const classes = useStyles()
  const icon = (
    <FontAwesomeIcon className={classes.icon} solid size="2x" {...props}>
      times-circle
    </FontAwesomeIcon>
  )

  return (
    <Tooltip title="Cancel" placement="bottom">
      {props.to ? <Link to={props.to}>{icon}</Link> : icon}
    </Tooltip>
  )
}

CloseButton.propTypes = {
  to: PropTypes.string,
  onClick: PropTypes.func,
}

export default CloseButton
