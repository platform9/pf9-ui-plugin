import React from 'react'
import PropTypes from 'prop-types'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  icon: {
    color: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.primary.dark,
    },
  },
}))

const CloseButton = props => {
  const classes = useStyles()
  if (props.to) {
    return (
      <Link to={props.to}>
        <FontAwesomeIcon className={classes.icon} solid size="2x" {...props}>times-circle</FontAwesomeIcon>
      </Link>
    )
  }
  return (
    <FontAwesomeIcon className={classes.icon} solid size="2x" {...props}>times-circle</FontAwesomeIcon>
  )
}

CloseButton.propTypes = {
  to: PropTypes.string,
  onClick: PropTypes.func,
}

export default CloseButton
