import React from 'react'
import PropTypes from 'prop-types'
import Checkbox from 'core/components/Checkbox'
import moize from 'moize'
import { assoc } from 'ramda'
import { TableCell, TableHead, TableRow, TableSortLabel, Tooltip } from '@material-ui/core'
import { compose } from 'utils/fp'
import { withStyles } from '@material-ui/styles'
import clsx from 'clsx'

const styles = theme => ({
  root: {
    // backgroundColor: theme.palette.grey[50],
    fontWeight: 'bold',
    color: theme.palette.text.primary,
    '& > tr': {
      height: 46,
    },
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
  headLabel: {
    fontSize: '13px',
    whiteSpace: 'nowrap',
  },
  cellLabel: {
    color: [theme.palette.text.primary, '!important'],
  },
  checkAllCell: {
    paddingRight: 0,
    minWidth: 60,
  },
})

class ListTableHead extends React.PureComponent {
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

    const headerCheckbox = !blankFirstColumn
      ? <TableCell padding="checkbox" key="_checkAll" className={clsx(classes.cellLabel,
        classes.checkAllCell)}>
        {showCheckboxes && <label className={classes.checkboxCell}>
          <Checkbox
            className={classes.checkbox}
            indeterminate={!checked && numSelected > 0 && numSelected < rowCount}
            checked={checked}
            onChange={onSelectAllClick}
            color='primary'
          />
          {numSelected > 0 ? <span>({numSelected})</span> : null}
        </label>}
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
          {columns.map((column, idx) =>
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
                  className={classes.headLabel}
                  active={orderBy === column.id}
                  direction={order}
                  onClick={this.createSortHandler(column.id)}
                >
                  {column.label} {idx === 0 ? `(${rowCount})` : ''}
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
