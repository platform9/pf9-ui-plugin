import React, { useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import PropTypes from 'prop-types'
import { Typography } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
  choice: {
    padding: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between',
  },
  icon: {
  },
  title: {
  },
  description: {
  },
}))

// This component presents large format blocks that the user can choose between.
// It is useful for choosing between major options that require a large amount of
// screen real-estate (help text, icons, etc on each option).
const BlockChooser = ({ options = [], onChange }) => {
  const classes = useStyles()
  const [choice, setChoice] = useState()

  return (
    <div className={classes.root}>
      {options.map(option => (
        <div className={classes.choice} key={option.id} onClick={() => setChoice(option.id)}>
          <div>radio {choice === option.id ? 'yes' : 'no'}</div>
          <div className={classes.icon}>{option.icon}</div>
          <div className={classes.title}>
            <Typography variant="h5">{option.title}</Typography>
          </div>
          <div className={classes.description}>
            <Typography variant="subtitle1">{option.description}</Typography>
          </div>
        </div>
      ))}
    </div>
  )
}

const blockOptionPropTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.oneOf([PropTypes.string, PropTypes.node]).isRequired,
  icon: PropTypes.node,
}

BlockChooser.propTypes = {
  options: PropTypes.arrayOf(blockOptionPropTypes),
  onChange: PropTypes.func,
}

export default BlockChooser
