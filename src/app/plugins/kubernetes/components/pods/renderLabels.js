import React from 'react'
import { Typography } from '@material-ui/core'
import { toPairs } from 'ramda'

const renderLabels = (type) => (labels) => {
  return (
    <Typography variant="body2" component="div">
      {toPairs(labels).map(([name, value]) => (
        <p key={name}>
          {name}: {value}
        </p>
      ))}
    </Typography>
  )
}

export default renderLabels
