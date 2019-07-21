import React from 'react'
import PropTypes from 'prop-types'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import { withStyles } from '@material-ui/styles'
import { compose } from 'app/utils/fp'

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

class MultiSelect extends React.Component {
  handleChange = e => {
    const { onChange } = this.props
    onChange && onChange(e.target.value)
  }

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
          displayEmpty
          multiple
        >
          {options.map(x => <MenuItem value={x.value} key={x.value}>{x.label}</MenuItem>)}
        </Select>
      </FormControl>
    )
  }
}

const optionPropType = PropTypes.shape({
  value: PropTypes.string,
  label: PropTypes.string,
})

MultiSelect.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(optionPropType).isRequired,
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
}

export default compose(
  withStyles(styles),
)(MultiSelect)
