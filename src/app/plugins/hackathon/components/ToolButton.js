import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'

const ToolButton = ({
  Icon,
  tool,
  text='',
  hotkey='',
  onClick,
  selected,
}) => {
  const handleClick = e => onClick(tool)

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

ToolButton.propTypes = {
  onClick: PropTypes.func.isRequired,
}

export default ToolButton
