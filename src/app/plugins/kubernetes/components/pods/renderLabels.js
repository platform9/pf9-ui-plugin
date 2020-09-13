import React from 'react'
import { Typography } from '@material-ui/core'
import { toPairs } from 'ramda'

const renderLabels = (type, variant = 'body2') => (labels) => {
  return (
    <Typography variant={variant} component="div">
      {toPairs(labels).map(([name, value]) => (
        <p key={name}>
          <b>{name}</b>: {value}
        </p>
      ))}
    </Typography>
  )
}

export default renderLabels
