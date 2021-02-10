import { Grid, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { allKey } from 'app/constants'
import Theme from 'core/themes/model'
import { compose, pathOr } from 'ramda'
import React, { useCallback, useState } from 'react'
import { pathStrOr } from 'utils/fp'
import Progress from '../progress/Progress'
import FilterToolbar from './filter-toolbar'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(2),
    minHeight: 300,
  },
  table: {
    minWidth: 800,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  emptyList: {
    textAlign: 'left',
    margin: theme.spacing(1, 4),
  },
}))

const CardTable = ({
  data,
  searchTarget,
  filters,
  filterValues,
  showSortOption,
  sortOptions,
  onSortChange,
  sortBy,
  sortTarget,
  loading,
  handleRefresh,
  children,
}) => {
  const classes = useStyles()
  const [searchTerm, setSearchTerm] = useState('')

  const filter = useCallback(
    (data) => {
      let filteredData = data
      filterValues.map(({ value, target, customFilterFn }) => {
        if (value && value !== allKey) {
          filteredData = customFilterFn
            ? customFilterFn(filteredData)
            : filteredData.filter((item) => pathStrOr('', target, item) === value)
        }
      })
      return filteredData
    },
    [filterValues],
  )

  const filterBySearch = useCallback(
    (data) => {
      return data.filter(
        (item) =>
          pathOr('', searchTarget.split('.'), item).match(new RegExp(searchTerm, 'i')) !== null,
      )
    },
    [searchTerm, searchTarget],
  )

  const sort = useCallback(
    (data) => {
      if (!showSortOption || !sortTarget) {
        return data
      }

      const sortedData = data.sort((a, b) => {
        const aValue = pathOr('', sortTarget.split('.'), a)
        const bValue = pathOr('', sortTarget.split('.'), b)
        return aValue.toLowerCase() > bValue.toLowerCase() ? 1 : -1
      })
      return sortBy === 'desc' ? sortedData.reverse() : sortedData
    },
    [showSortOption, sortTarget, sortBy],
  )

  const filteredData = compose(filter, filterBySearch, sort)(data)

  return (
    <Progress overlay loading={loading} renderContentOnMount>
      <Grid container justify="center">
        <Grid item xs={12} zeroMinWidth>
          <Paper className={classes.root} elevation={0}>
            <FilterToolbar
              filters={filters}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              showSortOption={showSortOption}
              sortOptions={sortOptions}
              onSortChange={onSortChange}
              sortBy={sortBy}
              onRefresh={handleRefresh}
            />
            <Grid container spacing={3} justify="flex-start">
              {filteredData.map(children)}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Progress>
  )
}

export default CardTable
