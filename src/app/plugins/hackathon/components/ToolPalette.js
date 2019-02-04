import React from 'react'
import PropTypes from 'prop-types'

import ToolButton from './ToolButton'

import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import PanToolIcon from '@material-ui/icons/PanTool'
import TouchAppIcon from '@material-ui/icons/TouchApp'
import ShowChartIcon from '@material-ui/icons/ShowChart'
import TextFormatIcon from '@material-ui/icons/TextFormat'

import { compose } from 'ramda'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  tool: {
    border: '1px solid black',
    textAlign: 'center',
  },
})

class ToolPalette extends React.Component {
  render () {
    const { onToolChange, selectedTool } = this.props

    return (
      <div>
        <ToolButton
          Icon={PanToolIcon}
          tool="move"
          text="move"
          hotkey="v"
          selected={selectedTool === 'move'}
          onClick={onToolChange}
        />
        <ToolButton
          Icon={TouchAppIcon}
          tool="select"
          text="select"
          hotkey="a"
          selected={selectedTool === 'select'}
          onClick={onToolChange}
        />
        <ToolButton
          Icon={DeleteIcon}
          tool="delete"
          text="delete"
          hotkey="d"
          selected={selectedTool === 'delete'}
          onClick={onToolChange}
        />
        <ToolButton
          Icon={AddIcon}
          tool="create"
          text="create component"
          hotkey="c"
          selected={selectedTool === 'create'}
          onClick={onToolChange}
        />
        <ToolButton
          Icon={EditIcon}
          tool="edit"
          text="edit properties"
          hotkey="e"
          selected={selectedTool === 'edit'}
          onClick={onToolChange}
        />
        <ToolButton
          Icon={TextFormatIcon}
          tool="text"
          text="text"
          hotkey="t"
          selected={selectedTool === 'text'}
          onClick={onToolChange}
        />
        <ToolButton
          Icon={ShowChartIcon}
          tool="wire"
          text="wire"
          hotkey="w"
          selected={selectedTool === 'wire'}
          onClick={onToolChange}
        />
      </div>
    )
  }
}

ToolPalette.propTypes = {
  onToolChange: PropTypes.func.isRequired,
  selectedTool: PropTypes.string.isRequired,
}

export default compose(
  withStyles(styles),
)(ToolPalette)
