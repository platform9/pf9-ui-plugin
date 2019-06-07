import React from 'react'
import PropTypes from 'prop-types'
import moize from 'moize'
import { assoc } from 'ramda'
import {
  Checkbox, TableCell, TableHead, TableRow, TableSortLabel, Tooltip,
} from '@material-ui/core'
import { compose } from 'utils/fp'
import { withStyles } from '@material-ui/styles'
import * as classnames from 'classnames'

const styles = theme => ({
  root: {
    // backgroundColor: theme.palette.grey[50],
    fontWeight: 'bold',
    color: theme.palette.text.primary,
  },
  checkboxCell: {
    display: ['flex', '!important'],
    flexFlow: 'row nowrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  checkbox: {
    paddingRight: 4,
  },
  cellLabel: {
    color: [theme.palette.text.primary, '!important'],
  },
  checkAllCell: {
    paddingRight: 0,
  },
  emptyCheckAllCell: {
    paddingRight: 20,
  },
})

class ListTableHead extends React.Component {
  createSortHandler = moize(id => event => {
    const { onRequestSort } = this.props
    if (onRequestSort) {
      onRequestSort(event, id)
    }
  })

  createDragHandler = moize(id => e => {
    e.dataTransfer.setData('columnId', id)
    this.setState(assoc('dragging', true))
  })

  createDropHandler = moize(id => e => {
    const sourceColumnId = e.dataTransfer.getData('columnId')
    this.props.onColumnsSwitch(sourceColumnId, id)
  })

  handleDragOver = e => e.preventDefault()

  render () {
    const {
      classes,
      canDragColumns,
      blankFirstColumn,
      checked,
      columns,
      numSelected,
      onSelectAllClick,
      order,
      orderBy,
      rowCount,
      showCheckboxes,
    } = this.props

    const headerCheckbox = showCheckboxes && !blankFirstColumn
      ? <TableCell padding="checkbox" key="_checkAll" className={classnames(classes.cellLabel,
        classes.checkAllCell, {
          [classes.emptyCheckAllCell]: !numSelected,
        })}>
        <label className={classes.checkboxCell}>
          <Checkbox
            className={classes.checkbox}
            indeterminate={!checked && numSelected > 0 && numSelected < rowCount}
            checked={checked}
            onChange={onSelectAllClick}
            color='primary'
          />
          {numSelected > 0 ? <span>({numSelected})</span> : null}
        </label>
      </TableCell>
      : null

    const firstBlank = blankFirstColumn ? <TableCell
      padding="checkbox"
      key="_checkAll"
      className={classes.cellLabel} /> : null

    return (
      <TableHead className={classes.root}>
        <TableRow>
          {headerCheckbox}
          {firstBlank}
          {columns.map(column =>
            <TableCell
              className={classes.cellLabel}
              draggable={canDragColumns}
              onDragStart={canDragColumns ? this.createDragHandler(column.id) : null}
              onDragOver={canDragColumns ? this.handleDragOver : null}
              onDrop={canDragColumns ? this.createDropHandler(column.id) : null}
              key={column.id}
              numeric={column.numeric}
              padding={column.disablePadding ? 'none' : 'default'}
              sortDirection={column.sort !== false && orderBy === column.id ? order : false}
            >
              <Tooltip
                title={column.label}
                placement={column.numeric ? 'bottom-end' : 'bottom-start'}
                enterDelay={300}
              >
                <TableSortLabel
                  active={orderBy === column.id}
                  direction={order}
                  onClick={this.createSortHandler(column.id)}
                >
                  {column.label}
                </TableSortLabel>
              </Tooltip>
            </TableCell>)}
        </TableRow>
      </TableHead>
    )
  }
}

ListTableHead.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string,
    display: PropTypes.bool,
    excluded: PropTypes.bool,
  })).isRequired,
  canDragColumns: PropTypes.bool,
  onColumnsSwitch: PropTypes.func,
  numSelected: PropTypes.number,
  onRequestSort: PropTypes.func,
  onSelectAllClick: PropTypes.func,
  order: PropTypes.string,
  orderBy: PropTypes.string,
  rowCount: PropTypes.number,
  showCheckboxes: PropTypes.bool,
  blankFirstColumn: PropTypes.bool,
}

ListTableHead.defaultProps = {
  numSelected: 0,
}

export default compose(
  withStyles(styles),
)(ListTableHead)
