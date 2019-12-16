import React from 'react'
import Panel from './Panel'
import { prop, lensPath, set } from 'ramda'
import { TextField } from '@material-ui/core'
import { useSelector, useDispatch } from 'react-redux'
import { themeActions } from 'core/themes/themeReducers'

const MiscPanel = () => {
  const theme = useSelector(prop('theme'))
  const dispatch = useDispatch()

  const handleChange = path => e => {
    const lens = lensPath(path.split('.'))
    const { value } = e.target
    dispatch(themeActions.setTheme(set(lens, value, theme)))
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
