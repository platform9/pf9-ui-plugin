import React from 'react'
import PropTypes from 'prop-types'
import Checkbox from '@material-ui/core/Checkbox'
import Typography from '@material-ui/core/Typography'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { withStyles } from '@material-ui/core/styles'
import moize from 'moize'

const styles = {
  root: {
    padding: '16px 24px 16px 24px',
    fontFamily: 'Roboto',
  },
  title: {
    marginLeft: '-7px',
    fontSize: '14px',
    color: '#424242',
    textAlign: 'left',
    fontWeight: 500,
  },
  formGroup: {
    marginTop: '8px',
  },
  formControl: {},
  checkbox: {
    padding: '0px',
    width: '32px',
    height: '32px',
  },
  checkboxRoot: {
    '&$checked': {
      color: '#027cb5',
    },
  },
  checked: {},
  label: {
    fontSize: '15px',
    marginLeft: '8px',
    color: '#4a4a4a',
  },
}

class ListTableColumnsPopover extends React.Component {
  static propTypes = {
    columns: PropTypes.array.isRequired,
    visibleColumns: PropTypes.array,
    onColumnsChange: PropTypes.func,
    classes: PropTypes.object,
  };

  handleColChange = moize(columnId => e => {
    this.props.onColumnsChange(columnId)
  });

  render () {
    const { classes, columns, visibleColumns } = this.props
    return (
      <FormControl component="fieldset" className={classes.root} aria-label="Columns">
        <Typography variant="caption" className={classes.title}>
          Columns
        </Typography>
        <FormGroup className={classes.formGroup}>
          {columns.map(column => {
            return (
              column.display !== 'excluded' && (
                <FormControlLabel
                  key={column.id}
                  classes={{
                    root: classes.formControl,
                    label: classes.label,
                  }}
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
                  label={column.label}
                />
              )
            )
          })}
        </FormGroup>
      </FormControl>
    )
  }
}

export default withStyles(styles)(ListTableColumnsPopover)
