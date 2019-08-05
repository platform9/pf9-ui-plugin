import React from 'react'
import PropTypes from 'prop-types'
import MenuItem from '@material-ui/core/MenuItem'
import { withStyles } from '@material-ui/styles'
import TextField from '@material-ui/core/TextField'

/**
 * Picklist is a bare-bones widget-only implmentation.
 * See PicklistField if you need ValidatedForm integration.
 */
const styles = theme => ({
  root: {
    display: ({ formField }) =>
      formField ? 'flex' : 'block',
    flexWrap: 'wrap',
    minWidth: 120,
    marginTop: theme.spacing(1),
  },
})

@withStyles(styles)
class Picklist extends React.Component {
  handleChange = e => {
    const { onChange } = this.props
    // Hack to work around the fact that Material UI's "Select" will ignore
    // an options with value of '' (empty string).
    const value = e.target.value === '__none__' ? '' : e.target.value
    onChange && onChange(value)
  }

  render () {
    const { className, classes, label, name, value, options, formField, ...restProps } = this.props

    const items = options.map(x =>
      typeof x === 'string' ? ({ value: x, label: x }) : x,
    ).map(x => ({
      label: x.label,
      // Hack to work around Material UI's Select ignoring empty string as a value
      value: x.value === '' ? '__none__' : x.value,
    }))

    // Hack to work around Material UI's Select ignoring empty string as a value
    const nonEmptyValue = value === '' ? '__none__' : value

    return <TextField
      {...restProps}
      select
      className={className}
      classes={classes}
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
  formField: PropTypes.bool,
}

Picklist.defaultProps = {
  formField: true,
}

export default Picklist
