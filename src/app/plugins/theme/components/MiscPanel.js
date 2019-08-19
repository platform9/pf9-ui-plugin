import React from 'react'
import Panel from './Panel'
import { compose, lensPath, set } from 'ramda'
import { TextField } from '@material-ui/core'
import { withAppContext } from 'core/AppProvider'
import { withStyles } from '@material-ui/styles'

const styles = theme => ({
})

const MiscPanel = ({ context, setContext }) => {
  const handleChange = path => e => {
    const lens = lensPath(path.split('.'))
    const { value } = e.target
    setContext({ theme: set(lens, value, context.theme) })
  }

  return (
    <Panel title="Misc">
      <div>
        spacing.unit &nbsp;
        <TextField type="number" value={context.theme.spacing(1)} onChange={handleChange('spacing.unit')} />
      </div>
    </Panel>
  )
}

export default compose(
  withAppContext,
  withStyles(styles),
)(MiscPanel)
