import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    marginBottom: '10px',
    marginLeft: theme.spacing(1),
  },
  label: {
    flexGrow: 0,
    fontWeight: 'bold',
    minWidth: '150px',
  },
}))

const PresetField = ({ label, value }) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <label className={classes.label}>{label}</label>
      <span>{value}</span>
    </div>
  )
}

PresetField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

export default PresetField
