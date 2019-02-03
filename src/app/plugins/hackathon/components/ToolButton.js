import React from 'react'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import { compose } from 'ramda'
import { withAppContext } from 'core/AppContext'

const ToolButton = ({ context, setContext, Icon, tool, text='', hotkey='' }) => {
  const handleClick = e => {
    setContext({ selectedTool: tool })
  }
  const selected = context.selectedTool === tool

  return (
    <Tooltip title={`${text} (${hotkey})`} placement="right-start">
      <Button
        variant="contained"
        color={selected ? 'primary' : 'default'}
        onClick={handleClick}
      >
        <Icon />
      </Button>
    </Tooltip>
  )
}

export default compose(
  withAppContext,
)(ToolButton)
