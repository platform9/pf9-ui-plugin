import { IconButton, Popover, Tooltip } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import ViewColumnIcon from '@material-ui/icons/ViewColumn'
import React from 'react'
import grey from '@material-ui/core/colors/grey'
import PropTypes from 'prop-types'
import { compose } from 'ramda'
import ListTableColumnsPopover from 'core/common/list_table/ListTableColumnsPopover'

const styles = theme => ({
  root: {
    outline: 'none',
    padding: theme.spacing.unit * 2
  },
  clearIcon: {
    '&:hover': {
      color: grey[800],
    },
    '&:active': {
      color: grey[200]
    }
  }
})

class ListTableColumnsSelector extends React.PureComponent {
  constructor (props) {
    super(props)
    this.inputRef = React.createRef()
  }

  state = {
    open: false,
    anchorEl: null,
  }

  handleClick = event => {
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    })
  }

  handleClose = () => {
    this.setState({
      open: false,
      anchorEl: null,
    })
  }

  render () {
    const {classes, columns, visibleColumns, onColumnsChange} = this.props
    const {open, anchorEl} = this.state

    return <React.Fragment>
      <Tooltip title="Select Columns">
        <IconButton
          className={classes.root}
          aria-owns={open ? 'simple-popper' : undefined}
          aria-label="Select Columns"
          aria-haspopup="true"
          variant="contained"
          onClick={this.handleClick}>
          <ViewColumnIcon />
        </IconButton>
      </Tooltip>
      <Popover
        open={open}
        onClose={this.handleClose}
        anchorEl={anchorEl}
        ref={this.inputRef}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}>
        <ListTableColumnsPopover
          columns={columns}
          visibleColumns={visibleColumns}
          onColumnsChange={onColumnsChange} />
      </Popover>
    </React.Fragment>
  }
}

ListTableColumnsSelector.propTypes = {
  columns: PropTypes.array.isRequired,
  onColumnsChange: PropTypes.func.isRequired,
}

export default compose(withStyles(styles))(ListTableColumnsSelector)
