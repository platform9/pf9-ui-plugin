import React from 'react'
import PropTypes from 'prop-types'
import FormControl from '@material-ui/core/FormControl'
import MenuItem from '@material-ui/core/MenuItem'
import { withStyles } from '@material-ui/styles'
import { compose } from 'app/utils/fp'
import clsx from 'clsx'
import TextField from '@material-ui/core/TextField'

/**
 * Picklist is a bare-bones widget-only implmentation.
 * See PicklistField if you need ValidatedForm integration.
 */
const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    marginTop: theme.spacing(1),
    minWidth: 200,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
})

class Picklist extends React.Component {
  handleChange = e => {
    const { onChange } = this.props
    // Hack to work around the fact that Material UI's "Select" will ignore
    // an options with value of '' (empty string).
    const value = e.target.value === '__none__' ? '' : e.target.value
    onChange && onChange(value)
  }

  render () {
    const { className, classes, label, name, value, options } = this.props

    const items = options.map(x =>
      typeof x === 'string' ? ({ value: x, label: x }) : x,
    ).map(x => ({
      label: x.label,
      // Hack to work around Material UI's Select ignoring empty string as a value
      value: x.value === '' ? '__none__' : x.value,
    }))

    // Hack to work around Material UI's Select ignoring empty string as a value
    const nonEmptyValue = value === '' ? '__none__' : value
    return (
      <FormControl classes={classes} className={clsx(classes.formControl, className)}>
        <TextField
          select
          variant="outlined"
          label={label}
          value={nonEmptyValue}
          SelectProps={{
            displayEmpty: true,
          }}
          onChange={this.handleChange}
          inputProps={{ name: label, id: name }}
        >
          {items.map(item => <MenuItem value={item.value} key={item.value}>{item.label}</MenuItem>)}
        </TextField>
      </FormControl>
    )
  }
}

const numOrString = PropTypes.oneOfType([PropTypes.number, PropTypes.string])
const optionPropType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
  PropTypes.shape({
    value: numOrString,
    label: numOrString,
  }),
])

Picklist.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(optionPropType).isRequired,
  value: numOrString,
  onChange: PropTypes.func,
}

export default compose(
  withStyles(styles),
)(Picklist)
