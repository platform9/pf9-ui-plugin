import { IconButton, Popover, Tooltip } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import FilterListIcon from '@material-ui/icons/FilterList'
import React from 'react'
import grey from '@material-ui/core/colors/grey'
import PropTypes from 'prop-types'
import { compose } from 'ramda'
import ListTableFiltersPopover from 'core/common/list_table/ListTableFiltersPopover'

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

class ListTableFiltersButton extends React.PureComponent {
  inputRef = React.createRef()

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
    const { classes, columns, filters, filterValues, onFilterUpdate, onFiltersReset } = this.props
    const { open, anchorEl } = this.state

    return <React.Fragment>
      <Tooltip title="Filter list">
        <IconButton
          className={classes.root}
          aria-owns={open ? 'simple-popper' : undefined}
          aria-label="Filter list"
          aria-haspopup="true"
          variant="contained"
          onClick={this.handleClick}>
          <FilterListIcon />
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
        <ListTableFiltersPopover
          columns={columns}
          filters={filters}
          filterValues={filterValues}
          onFilterUpdate={onFilterUpdate}
          onFiltersReset={onFiltersReset} />
      </Popover>
    </React.Fragment>
  }
}

ListTableFiltersButton.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.shape({
    columnId: PropTypes.string.isRequired,
    label: PropTypes.string, // Will override column label
    type: PropTypes.oneOf(['select', 'multiselect', 'checkbox', 'custom']).isRequired,
    render: PropTypes.func, // Use for rendering a custom component, received props: {value, onChange}
    filterWith: PropTypes.func, // Custom filtering function, received params: (filterValue, value, row)
    items: PropTypes.array, // Array of possible values (only when using select/multiselect)
  })),
  filterValues: PropTypes.object,
  onFilterUpdate: PropTypes.func,
  onFiltersReset: PropTypes.func,
}

export default compose(
  withStyles(styles)
)(ListTableFiltersButton)
