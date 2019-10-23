import React from 'react'
import { Typography } from '@material-ui/core'
import { toPairs } from 'ramda'

const stylesByType = {
  label: { color: '#00C036', fontWeight: 400 },
  selector: { color: '#9c3ef0', fontWeight: 400 }
}
const renderLabels = type => labels => {
  return <Typography style={stylesByType[type]} variant="body2" component="div">
    {toPairs(labels).map(([name, value]) =>
      <p key={name}>{name}: {value}</p>)}
  </Typography>
}

export default renderLabels
