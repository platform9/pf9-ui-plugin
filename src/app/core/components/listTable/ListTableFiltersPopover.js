import React from 'react'
import PropTypes from 'prop-types'
import { Checkbox, FormControl, FormControlLabel, FormGroup, InputLabel, MenuItem, Select, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import { compose, prop, propEq } from 'ramda'

export const styles = {
  root: {
    padding: '16px 24px 16px 24px',
    fontFamily: 'Roboto',
  },
  header: {
    flex: '0 0 auto',
    marginBottom: '16px',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
  },
  title: {
    display: 'inline-block',
    marginLeft: '7px',
    color: '#424242',
    fontSize: '14px',
    fontWeight: 500,
  },
  reset: {
    alignSelf: 'left',
  },
  resetLink: {
    color: '#027cb5',
    backgroundColor: '#FFF',
    display: 'inline-block',
    marginLeft: '24px',
    fontSize: '12px',
    cursor: 'pointer',
    border: 'none',
    '&:hover': {
      color: '#FF0000',
    },
  },
  filtersSelected: {
    alignSelf: 'right',
  },

  /* filter controls */
  filters: {
    display: 'flex',
    marginTop: '16px',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '80%',
    justifyContent: 'space-between',
  },
  formGroup: {
    flex: '1 1 calc(50% - 24px)',
    marginRight: '24px',
    marginBottom: '24px',
  },
}

class ListTableFiltersPopover extends React.Component {
  renderWrappedFilter = filter => <FormGroup
    key={filter.columnId}
    className={this.props.classes.formGroup}>
    {this.renderFilter(filter)}
  </FormGroup>

  renderFilter = ({ columnId, ...filter }) => {
    const { filterValues, columns, classes, onFilterUpdate } = this.props
    const value = prop(columnId, filterValues)
    const label = filter.label || prop('label', columns.find(propEq('id', columnId)))
    const onChange = value => onFilterUpdate(columnId, value)

    switch (filter.type) {
      case 'select':
        return <FormControl className={classes.formControl}>
          <InputLabel htmlFor={`filter-${columnId}`}>{label}</InputLabel>
          <Select
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            inputProps={{
              id: `filter-${columnId}`
            }}
          >
            {filter.items.map(item => <MenuItem key={item} value={item}>
              <em>{item}</em>
            </MenuItem>)}
          </Select>
        </FormControl>

      case 'multiselect':
        return <FormControl className={classes.formControl}>
          <InputLabel htmlFor={`filter-${columnId}`}>{label}</InputLabel>
          <Select
            multiple
            value={value || []}
            onChange={e => onChange(e.target.value)}
            renderValue={selected => selected.join(', ')}
            inputProps={{
              id: `filter-${columnId}`
            }}
          >
            {filter.items.map(item => <MenuItem key={item} value={item}>
              <em>{item}</em>
            </MenuItem>)}
          </Select>
        </FormControl>

      case 'checkbox':
        return <FormControlLabel
          classes={{
            root: this.props.classes.formControl,
            label: this.props.classes.label,
          }}
          label={label}
          control={<Checkbox
            className={classes.checkbox}
            classes={{
              root: classes.checkboxRoot,
              checked: classes.checked,
            }}
            onChange={e => onChange(e.target.checked)}
            checked={!!value}
          />} />

      default:
      case 'custom':
        return filter.render({ value, onChange })
    }
  }

  render () {
    const { classes, filters, onFiltersReset } = this.props
    return (
      <div className={classes.root}>
        <div className={classes.header}>
          <div className={classes.reset}>
            <Typography
              variant="caption"
              className={classes.title}>
              Filters
            </Typography>
            <button className={classes.resetLink} tabIndex={0}
              aria-label="Reset" onClick={onFiltersReset}>
              Reset
            </button>
          </div>
          <div className={classes.filtersSelected} />
        </div>
        <div className={classes.filters}>
          {filters.map(this.renderWrappedFilter)}
        </div>
      </div>
    )
  }
}

ListTableFiltersPopover.defaultProps = {
  filterValues: {}
}

ListTableFiltersPopover.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.shape({
    columnId: PropTypes.string.isRequired,
    label: PropTypes.string, // Will override column label
    type: PropTypes.oneOf(['select', 'multiselect', 'checkbox', 'custom']).isRequired,
    render: PropTypes.func, // Use for rendering a custom component, received props: {value, onChange}
    filterWith: PropTypes.func, // Custom filtering function, received params: (filterValue, value, row)
    items: PropTypes.array, // Array of possible values (only when using select/multiselect)
  })),
  filterValues: PropTypes.object,
  onFilterUpdate: PropTypes.func,
  onFiltersReset: PropTypes.func,
}

export default compose(
  withStyles(styles)
)(ListTableFiltersPopover)
