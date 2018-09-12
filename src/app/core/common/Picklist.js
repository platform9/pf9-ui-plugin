import React from 'react'
import PropTypes from 'prop-types'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import { withStyles } from '@material-ui/core/styles'
import { compose } from 'core/fp'

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
  handleChange = e => this.props.onChange && this.props.onChange(e.target.value)

  render () {
    const { classes, label, name, value } = this.props

    const options = this.props.options.map(x =>
      typeof x === 'string' ? ({ value: x, label: x }) : x
    )

    return (
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor={name}>{label}</InputLabel>
        <Select
          value={value}
          onChange={this.handleChange}
          inputProps={{ name: label, id: name }}
        >
          {options.map(x => <MenuItem value={x.value} key={x.value}>{x.label}</MenuItem>)}
        </Select>
      </FormControl>
    )
  }
}

Picklist.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ])).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
}

export default compose(
  withStyles(styles),
)(Picklist)
