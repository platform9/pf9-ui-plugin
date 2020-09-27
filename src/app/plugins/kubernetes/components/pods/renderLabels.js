import React from 'react'
import Text from 'core/elements/text'
import { toPairs } from 'ramda'

const renderLabels = (type, variant = 'body2') => (labels) => {
  return (
    <Text variant={variant} component="div">
      {toPairs(labels).map(([name, value]) => (
        <p key={name}>
          <b>{name}</b>: {value}
        </p>
      ))}
    </Text>
  )
}

export default renderLabels
