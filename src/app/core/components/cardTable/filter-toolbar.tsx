import React from 'react'
import { Toolbar } from '@material-ui/core'
import Theme from 'core/themes/model'
import { makeStyles } from '@material-ui/styles'
import SearchBar from '../SearchBar'
import RefreshButton from '../buttons/refresh-button'
import SortByPicklist from 'k8s/components/apps/sort-by-picklist'

const useStyles = makeStyles((theme: Theme) => ({
  toolbar: {
    backgroundColor: theme.palette.grey[100],
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    marginBottom: theme.spacing(3),
    '& .MuiOutlinedInput-root': {
      marginBottom: theme.spacing(1),
      marginRight: theme.spacing(2),
    },
  },
  filters: {
    display: 'flex',
    flexFlow: 'row nowrap',
    gap: '16px',
    alignItems: 'center',
    justifySelf: 'start',
  },
  controls: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    justifySelf: 'end',
    '& hr': {
      marginLeft: theme.spacing(2),
    },
  },
  search: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(2),
  },
  divider: {
    width: 1,
    height: '48px',
    backgroundColor: theme.palette.grey[200],
    border: 'none',
  },
}))

interface Props {
  filters?: JSX.Element
  showSortOption?: boolean
  sortOptions?: any
  onSortChange?: (value) => void
  sortBy?: string
  searchTerm: string
  onSearchChange: (value) => any
  onRefresh?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
}

const FilterToolbar = ({
  filters,
  showSortOption = false,
  sortOptions = [],
  onSortChange,
  sortBy,
  searchTerm,
  onSearchChange,
  onRefresh,
}: Props) => {
  const classes = useStyles()
  return (
    <Toolbar className={classes.toolbar}>
      <div className={classes.filters}>
        {filters}
        {showSortOption && (
          <>
            <hr className={classes.divider} />
            <SortByPicklist
              onChange={onSortChange}
              options={sortOptions}
              value={sortBy}
              selectFirst={true}
            />
          </>
        )}
      </div>
      <div className={classes.controls}>
        <SearchBar
          className={classes.search}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
        />
        {onRefresh && (
          <>
            <hr className={classes.divider} />
            <RefreshButton onRefresh={onRefresh} />
          </>
        )}
      </div>
    </Toolbar>
  )
}

export default FilterToolbar
