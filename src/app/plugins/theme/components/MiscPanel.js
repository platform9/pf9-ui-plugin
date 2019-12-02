import React, { useContext } from 'react'
import Panel from './Panel'
import { lensPath, set } from 'ramda'
import { TextField } from '@material-ui/core'
import { AppContext } from 'core/providers/AppProvider'

const MiscPanel = () => {
  const { theme, setContext } = useContext(AppContext)
  const handleChange = path => e => {
    const lens = lensPath(path.split('.'))
    const { value } = e.target
    setContext({ theme: set(lens, value, theme) })
  }

  return (
    <Panel title="Misc">
      <div>
        spacing.unit &nbsp;
        <TextField type="number" value={theme.spacing(1)} onChange={handleChange('spacing.unit')} />
      </div>
    </Panel>
  )
}

export default MiscPanel
