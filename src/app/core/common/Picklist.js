import React from 'react'
import PropTypes from 'prop-types'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import { withStyles } from '@material-ui/core/styles'
import { compose } from 'core/fp'

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    marginTop: theme.spacing.unit,
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2,
  },
})

class Picklist extends React.Component {
  get options () {
    const opts = this.props.options
    if (opts.length === 0) { return [] }
    if (typeof opts[0] === 'string') {
      return opts.map(x => ({ value: x, label: x }))
    }
    return opts
  }

  handleChange = () => {
    console.log('handleChange')
  }

  render () {
    const { classes, label, name, value } = this.props
    return (
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor={name}>{label}</InputLabel>
        <Select
          value={value || ''}
          onChange={this.handleChange}
          inputProps={{ name: label, id: name }}
        >
          {this.options.map(x => <MenuItem value={x.value} key={x.value}>{x.label}</MenuItem>)}
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
}

export default compose(
  withStyles(styles),
)(Picklist)
