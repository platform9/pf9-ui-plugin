import { Toolbar, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import SearchBar from 'core/components/SearchBar'
import React from 'react'
import Picklist from 'core/components/Picklist'
import PropTypes from 'prop-types'
import { projectAs } from 'utils/fp'
import ArrowDownward from '@material-ui/icons/ArrowDownward'
import ArrowUpward from '@material-ui/icons/ArrowUpward'
import Button from '@material-ui/core/Button'

const styles = theme => ({
  root: {
    paddingRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    '& .MuiOutlinedInput-root': {
      marginBottom: theme.spacing(1),
    },
  },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    color: theme.palette.text.secondary,
    width: '100%',
  },
  filters: {
    flexGrow: '1',
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    justifyContent: 'left',
  },
  controls: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    justifyContent: 'right',
  },
  title: {
    flex: '0 0 auto',
  },
})

const CustomPicklist = withStyles(theme => ({
  root: {
    '& .MuiOutlinedInput-root': {
      marginBottom: theme.spacing(1),
    },
  },
}))(Picklist)

const FilterDropdown = ({
  field,
  type,
  label,
  onChange,
  value,
  items,
}) => {
  switch (type) {
    case 'select':
      return (
        <CustomPicklist
          name={field}
          label={label}
          options={items}
          value={value || ''}
          onChange={onChange}
        />
      )
    default:
      return <div />
  }
}

const SortDropdown = ({ items, value, onChange }) => {
  return (
    <CustomPicklist
      name={'sort'}
      label={'Sort By'}
      options={items}
      value={value || ''}
      onChange={onChange}
    />
  )
}

const SortDirection = ({ disabled, value, onChange }) => {
  return (
    <Button
      disabled={disabled}
      title={value === 'asc' ? 'Asc' : 'Desc'}
      onClick={disabled ? null : onChange(value === 'asc' ? 'desc' : 'asc')}
    >
      {value === 'asc' ? <ArrowDownward /> : <ArrowUpward />}
    </Button>
  )
}

const CardTableToolbar = ({
  title,
  classes,
  sorting = [],
  direction,
  orderBy,
  filters = [],
  filterValues,
  onSortChange,
  onDirectionChange,
  onFilterUpdate,
  onSearchChange,
  searchTerm,
}) => (
  <Toolbar className={classes.root}>
    {title && (
      <div>
        <div className={classes.title}>
          <Typography variant="h6">{title}</Typography>
        </div>
        <div className={classes.spacer} />
      </div>
    )}
    <div className={classes.actions}>
      <div className={classes.filters}>
        {Array.isArray(filters)
          ? filters.map(({ field, value, ...filterProps }) => (
            <FilterDropdown
              key={field}
              {...filterProps}
              classes={classes}
              onChange={onFilterUpdate(field)}
              field={field}
              value={value !== undefined ? value : filterValues[field]}
            />
          ))
          : filters}
      </div>
      <div className={classes.controls}>
        {sorting.length && (
          <React.Fragment>
            <SortDropdown
              classes={classes}
              items={projectAs({ label: 'label', value: 'field' }, sorting)}
              value={orderBy}
              onChange={onSortChange}
            />
            <SortDirection
              disabled={!orderBy}
              value={direction}
              onChange={onDirectionChange}
            />
          </React.Fragment>
        )}
        {onSearchChange && (
          <SearchBar onSearchChange={onSearchChange} searchTerm={searchTerm} />
        )}
      </div>
    </div>
  </Toolbar>
)

export const filterSpecPropType = PropTypes.shape({
  field: PropTypes.string.isRequired,
  label: PropTypes.string, // Will override column label
  type: PropTypes.oneOf(['select', 'multiselect', 'checkbox', 'custom']).isRequired,
  render: PropTypes.func, // Use for rendering a custom component, received props: {value, onChange}
  filterWith: PropTypes.func, // Custom filtering function, received params: (filterValue, value, row)
  items: PropTypes.array, // Array of possible values (only when using select/multiselect)
})

CardTableToolbar.propTypes = {
  direction: PropTypes.oneOf(['asc', 'desc']),
  orderBy: PropTypes.string,
  onSortChange: PropTypes.func,
  onDirectionChange: PropTypes.func,
  onSearchChange: PropTypes.func,
  searchTerm: PropTypes.string,
  title: PropTypes.string,
  classes: PropTypes.object.isRequired,
  filters: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(filterSpecPropType)]),
  filterValues: PropTypes.object,
  onFilterUpdate: PropTypes.func,
}

export default withStyles(styles)(CardTableToolbar)
