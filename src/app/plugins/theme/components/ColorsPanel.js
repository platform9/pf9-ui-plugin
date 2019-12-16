import React from 'react'
import ColorPicker from './ColorPicker'
import Panel from './Panel'
import { useTheme } from '@material-ui/core/styles'
import { Typography } from '@material-ui/core'

const ColorGroup = ({ title, colors }) => {
  return (
    <>
      <Typography variant="h6">{`palette.${title}`}</Typography>
      {Object.entries(colors).map(([name, color]) => (
        <ColorPicker path={`palette.${title}.${name}`} title={name} />
      ))}
      <br />
    </>
  )
}

const ColorsPanel = () => {
  const theme = useTheme()
  const filteredKeys = Object.keys(theme.palette).filter(
    (key) => typeof theme.palette[key] === 'object',
  )
  return (
    <Panel title="Palette" defaultExpanded>
      {filteredKeys.map((name) => (
        <ColorGroup title={name} colors={theme.palette[name]} />
      ))}
    </Panel>
  )
}

export default ColorsPanel
