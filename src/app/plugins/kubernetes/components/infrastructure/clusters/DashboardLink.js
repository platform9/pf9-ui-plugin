import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/styles'
import Tooltip from '@material-ui/core/Tooltip'
import ExternalLink from 'core/components/ExternalLink'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    paddingBottom: theme.spacing(0.5),
  },
  label: {
    fontSize: 12,
    width: 58,
    fontWeight: 'bold',
  },
  icon: {
    fontSize: 12,
    whiteSpace: 'nowrap',
    width: 77,
  },
}))

const DashboardLink = ({ label, link }) => {
  const classes = useStyles()
  return (
    <Tooltip title={`${label} Dashboard`}>
      <div className={classes.root}>
        <span className={classes.label}>{label}:</span>
        <span className={classes.icon}>
          <ExternalLink url={link}>
            <FontAwesomeIcon>chart-line</FontAwesomeIcon>
          </ExternalLink>
        </span>
      </div>
    </Tooltip>
  )
}

DashboardLink.propTypes = {
  label: PropTypes.string,
  link: PropTypes.string,
}

export default DashboardLink
