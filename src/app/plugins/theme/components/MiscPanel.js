import React from 'react'
import Panel from './Panel'
import { lensPath, set } from 'ramda'
import { TextField } from '@material-ui/core'
import { useCustomTheme } from 'core/themes/ThemeManager'

const lens = lensPath('spacing.unit'.split('.'))

const MiscPanel = () => {
  const [theme, setCustomTheme] = useCustomTheme()

  const handleChange = (e) => {
    const { value } = e.target
    setCustomTheme(set(lens, value, theme))
  }

  return (
    <Panel title="Misc">
      <div>
        spacing.unit &nbsp;
        <TextField type="number" value={theme.spacing(1)} onChange={handleChange} />
      </div>
    </Panel>
  )
}

export default MiscPanel
