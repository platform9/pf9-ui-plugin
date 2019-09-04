import { Toolbar, Typography, Tooltip } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import SearchBar from 'core/components/SearchBar'
import React, { useMemo } from 'react'
import Picklist from 'core/components/Picklist'
import PropTypes from 'prop-types'
import { projectAs } from 'utils/fp'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'

const useStyles = makeStyles(theme => ({
  root: {
    paddingRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    '& .MuiOutlinedInput-root': {
      marginBottom: theme.spacing(1),
      marginRight: theme.spacing(2),
    },
  },
  spacer: {
    flex: '1 1 100%',
  },
  search: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(2),
  },
  sortBy: {
    marginRight: 0,
  },
  actions: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    color: theme.palette.text.secondary,
    width: '100%',
  },
  button: {
    cursor: 'pointer',
    fontWeight: 300,
    margin: theme.spacing(1, 1, 0, 0),
    height: theme.spacing(3),
    outline: 'none',
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
}))

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
        <Picklist
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

const CardTableToolbar = ({
  title,
  sorting = [],
  orderDirection,
  orderBy,
  filters = [],
  filterValues,
  onSortChange,
  onDirectionSwitch,
  onFilterUpdate,
  onRefresh,
  onSearchChange,
  searchTerm,
}) => {
  const classes = useStyles()
  const sortDirection = useMemo(() =>
    onDirectionSwitch && <Tooltip title={orderDirection === 'asc' ? 'Asc' : 'Desc'}>
      <FontAwesomeIcon
        className={classes.button}
        solid
        size="lg"
        aria-label="Change direction"
        onClick={onDirectionSwitch}>
        {orderDirection === 'asc' ? 'arrow-down' : 'arrow-up'}
      </FontAwesomeIcon>
    </Tooltip>, [orderDirection, onDirectionSwitch])
  const refreshButton = useMemo(() =>
    onRefresh && <Tooltip title="Refresh list">
      <FontAwesomeIcon
        className={classes.button}
        solid
        size="lg"
        aria-label="Refresh list"
        onClick={onRefresh}>
        {'sync'}
      </FontAwesomeIcon>
    </Tooltip>, [onRefresh])

  return <Toolbar className={classes.root}>
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
          <>
            <Picklist
              className={classes.sortBy}
              notAsync
              disabled={false}
              showAll={false}
              name={'sort'}
              label={'Sort By'}
              options={projectAs({ label: 'label', value: 'field' }, sorting)}
              value={orderBy || ''}
              onChange={onSortChange}
            />
            {sortDirection}
          </>
        )}
        {onSearchChange && (
          <SearchBar
            className={classes.search}
            onSearchChange={onSearchChange}
            searchTerm={searchTerm} />
        )}
        {refreshButton}
      </div>
    </div>
  </Toolbar>
}

export const filterSpecPropType = PropTypes.shape({
  field: PropTypes.string.isRequired,
  label: PropTypes.string, // Will override column label
  type: PropTypes.oneOf(['select', 'multiselect', 'checkbox', 'custom']).isRequired,
  render: PropTypes.func, // Use for rendering a custom component, received props: {value, onChange}
  filterWith: PropTypes.func, // Custom filtering function, received params: (filterValue, value, row)
  items: PropTypes.array, // Array of possible values (only when using select/multiselect)
})

CardTableToolbar.propTypes = {
  orderDirection: PropTypes.oneOf(['asc', 'desc']),
  orderBy: PropTypes.string,
  onSortChange: PropTypes.func,
  onDirectionSwitch: PropTypes.func,
  onSearchChange: PropTypes.func,
  onRefresh: PropTypes.func,
  searchTerm: PropTypes.string,
  title: PropTypes.string,
  filters: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(filterSpecPropType)]),
  filterValues: PropTypes.object,
  onFilterUpdate: PropTypes.func,
}

export default CardTableToolbar
