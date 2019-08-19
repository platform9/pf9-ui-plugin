import React from 'react'
import Panel from './Panel'
import TypographyVariant from './TypographyVariant'
import { path } from 'ramda'
import { withAppContext } from 'core/AppProvider'

const TypographyPanel = ({ context: { theme } }) => {
  const isVariant = x => !!path([x, 'fontSize'], theme.typography)
  const variantKeys = Object.keys(theme.typography).filter(isVariant)
  return (
    <Panel title="Typography">
      {variantKeys.map(key => <TypographyVariant key={key} variant={key} />)}
    </Panel>
  )
}

export default withAppContext(TypographyPanel)
