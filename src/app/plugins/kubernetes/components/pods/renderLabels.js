import React from 'react'
import Text from 'core/elements/text'
import { toPairs } from 'ramda'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles((theme) => ({
  label: {
    '& p': {
      margin: 0,
    },
  },
}))

const RenderLabels = ({ variant, labels }) => {
  const classes = useStyles()
  return (
    <Text variant={variant} className={classes.label} component="div">
      {toPairs(labels).map(([name, value]) => (
        <p key={name}>
          <b>{name}</b>: {value}
        </p>
      ))}
    </Text>
  )
}

const renderLabels = (type, variant = 'body2') => (labels) => (
  <RenderLabels variant={variant} labels={labels} />
)

export default renderLabels
