import React from 'react'
import PropTypes from 'prop-types'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/styles'
import { Tooltip } from '@material-ui/core'
import IconButton from 'core/elements/icon-button'

const useStyles = makeStyles((theme) => ({
  link: {
    display: 'block',
  },
}))

const CloseButton = ({ tooltip = 'Cancel', ...props }) => {
  const classes = useStyles()
  const icon = <IconButton icon="times-circle" {...props} />

  return (
    <Tooltip title={tooltip} placement="bottom">
      {props.to ? (
        <Link className={classes.link} to={props.to}>
          {icon}
        </Link>
      ) : (
        icon
      )}
    </Tooltip>
  )
}

CloseButton.propTypes = {
  to: PropTypes.string,
  onClick: PropTypes.func,
}

export default CloseButton
