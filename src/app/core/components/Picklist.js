import React from 'react'
import PropTypes from 'prop-types'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import { withStyles } from '@material-ui/core/styles'
import { compose } from 'core/../../utils/fp'

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
    const { classes, label, name } = this.props

    const options = this.props.options.map(x =>
      typeof x === 'string' ? ({ value: x, label: x }) : x
    ).map(x => ({
      label: x.label,
      // Hack to work around Material UI's Select ignoring empty string as a value
      value: x.value === '' ? '__none__' : x.value
    }))

    // Hack to work around Material UI's Select ignoring empty string as a value
    const value = this.props.value === '' ? '__none__' : this.props.value

    return (
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor={name}>{label}</InputLabel>
        <Select
          value={value}
          onChange={this.handleChange}
          inputProps={{ name: label, id: name }}
          displayEmpty
        >
          {options.map(x => <MenuItem value={x.value} key={x.value}>{x.label}</MenuItem>)}
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
  })
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
