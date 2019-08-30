import React from 'react'
import PropTypes from 'prop-types'
import { Checkbox, FormControl, FormControlLabel, FormGroup, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import { ensureFunction } from 'app/utils/fp'
import moize from 'moize'
import { compose } from 'ramda'

const styles = {
  root: {
    padding: '16px 24px 16px 24px',
    fontFamily: 'Roboto',
  },
  title: {
    marginLeft: -7,
    fontSize: '14px',
    color: '#424242',
    textAlign: 'left',
    fontWeight: 500,
  },
  formGroup: {
    marginTop: 8,
  },
  formControl: {},
  checkbox: {
    padding: 0,
    width: 32,
    height: 32,
  },
  checkboxRoot: {
    '&$checked': {
      color: '#027cb5',
    },
  },
  checked: {},
  label: {
    fontSize: 15,
    marginLeft: '8px',
    color: '#4a4a4a',
  },
}

class ListTableColumnPopover extends React.PureComponent {
  handleColChange = moize(columnId => e => {
    ensureFunction(this.props.onColumnToggle)(columnId)
  })

  render () {
    const { classes, columns, visibleColumns } = this.props
    return (
      <FormControl component="fieldset" className={classes.root} aria-label="Columns">
        <Typography variant="caption" className={classes.title}>
          Columns
        </Typography>
        <FormGroup className={classes.formGroup}>
          {columns.filter(column => column.excluded !== true).map(column =>
            <FormControlLabel
              key={column.id}
              classes={{
                root: classes.formControl,
                label: classes.label,
              }}
              label={column.label}
              control={
                <Checkbox
                  className={classes.checkbox}
                  classes={{
                    root: classes.checkboxRoot,
                    checked: classes.checked,
                  }}
                  onChange={this.handleColChange(column.id)}
                  checked={visibleColumns.includes(column.id)}
                  value={column.label}
                />
              }
            />
          )}
        </FormGroup>
      </FormControl>
    )
  }
}

ListTableColumnPopover.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string,
    display: PropTypes.bool,
    excluded: PropTypes.bool,
  })).isRequired,
  visibleColumns: PropTypes.array,
  onColumnToggle: PropTypes.func,
  classes: PropTypes.object,
}

export default compose(
  withStyles(styles)
)(ListTableColumnPopover)
