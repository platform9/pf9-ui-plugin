import React from 'react'
import ColorPicker from './ColorPicker'
import Panel from './Panel'
import { prop } from 'ramda'
import { Typography } from '@material-ui/core'
import { themeStoreKey } from 'core/themes/themeReducers'
import { useSelector } from 'react-redux'

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
  const theme = useSelector(prop(themeStoreKey))
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
