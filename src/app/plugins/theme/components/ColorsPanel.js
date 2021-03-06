import React from 'react'
import ColorPicker from './ColorPicker'
import Panel from './Panel'
import Text from 'core/elements/text'
import { useTheme } from '@material-ui/core/styles'

const ColorGroup = ({ title, colors, parent = 'palette' }) => {
  return (
    <>
      <Text variant="h6">{`${parent}.${title}`}</Text>
      {Object.entries(colors).map(([name, color]) => (
        <ColorPicker path={`${parent}.${title}.${name}`} title={name} />
      ))}
      <br />
    </>
  )
}

const ColorsPanel = () => {
  const theme = useTheme()
  const paletteKeys = Object.keys(theme.palette).filter(
    (key) => typeof theme.palette[key] === 'object',
  )
  const typographyKeys = Object.keys(theme.typography).filter(
    (key) => typeof theme.typography[key] === 'object',
  )

  return (
    <>
      <Panel title="Palette" defaultExpanded>
        {paletteKeys.map((name) => (
          <ColorGroup title={name} colors={theme.palette[name]} />
        ))}
      </Panel>
      <Panel title="Typography" defaultExpanded>
        {typographyKeys.map((name) => {
          return (
            <>
              <ColorPicker path={`typography.${name}.color`} title={name} />
              <br />
            </>
          )
        })}
      </Panel>
    </>
  )
}

export default ColorsPanel
