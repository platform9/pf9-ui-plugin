import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { range } from 'ramda'
import PropTypes from 'prop-types'
import { Typography } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(1),
    width: ({ width }) => width,
    height: 100,
    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  squaresContainer: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'center',
  },
  squareColumn: {
    display: 'flex',
    flexFlow: 'column-reverse nowrap',
  },
  square: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#4ADF74',
    marginBottom: 2,
    marginRight: 2,
  },
  label: {
    paddingTop: 5,
    textAlign: 'center',
    width: '100%',
  },
}))

const Square = () => {
  const classes = useStyles()
  return <div className={classes.square} />
}

const squaresPerColumn = 5

const SquaresGraph = ({ num, label, ...rest }) => {
  const classes = useStyles(rest)
  const columns = Math.ceil(num / squaresPerColumn)
  let squareKey = num

  return <div className={classes.root}>
    <div className={classes.squaresContainer}>
      {range(0, columns).map(col => <div key={col} className={classes.squareColumn}>
        {range(0, 5).map(() => squareKey ? <Square key={--squareKey} /> : null)}
      </div>)}
    </div>
    <Typography variant="caption" className={classes.label}>
      {label}
    </Typography>
  </div>
}

SquaresGraph.propTypes = {
  num: PropTypes.number.isRequired,
  label: PropTypes.string,
}

SquaresGraph.defaultProps = {
  width: 150,
}

export default SquaresGraph
