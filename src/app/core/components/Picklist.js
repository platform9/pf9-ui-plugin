import React from 'react'
import PropTypes from 'prop-types'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import { withStyles } from '@material-ui/core/styles'
import { compose } from 'app/utils/fp'
import classnames from 'classnames'

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
    marginTop: theme.spacing.unit,
    minWidth: 200,
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2,
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
      typeof x === 'string' ? ({ value: x, label: x }) : x
    ).map(x => ({
      label: x.label,
      // Hack to work around Material UI's Select ignoring empty string as a value
      value: x.value === '' ? '__none__' : x.value
    }))

    // Hack to work around Material UI's Select ignoring empty string as a value
    const nonEmptyValue = value === '' ? '__none__' : value
    return (
      <FormControl className={classnames(classes.formControl, className)}>
        <InputLabel htmlFor={name}>{label}</InputLabel>
        <Select
          value={nonEmptyValue}
          onChange={this.handleChange}
          inputProps={{ name: label, id: name }}
          displayEmpty
        >
          {items.map(item => <MenuItem value={item.value} key={item.value}>{item.label}</MenuItem>)}
        </Select>
      </FormControl>
    )
  }
}

const optionPropType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string,
  }),
])

Picklist.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(optionPropType).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
}

export default compose(
  withStyles(styles),
)(Picklist)
