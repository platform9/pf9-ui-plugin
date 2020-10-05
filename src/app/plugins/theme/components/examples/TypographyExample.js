import React from 'react'
import Panel from '../Panel'
import Text from 'core/elements/text'

const typographyVariants = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'subtitle1',
  'subtitle2',
  'body1',
  'body2',
  'caption',
  'button',
  'overline',
]

const TypographyExample = ({ expanded = false }) => (
  <Panel title="Typography" defaultExpanded={expanded}>
    <div>
      {typographyVariants.map((variant) => (
        <div key={variant}>
          <Text variant={variant}>{variant}</Text>
          <br />
        </div>
      ))}
    </div>
  </Panel>
)

export default TypographyExample
