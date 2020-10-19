import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import React, { useEffect } from 'react'
import useReactRouter from 'use-react-router'
import PicklistDefault from 'core/components/Picklist'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.
import SearchBar from './SearchBar'
import { allKey } from 'app/constants'
import { Route } from 'core/utils/routes'

interface Props {
  data: Array<String>
  setFilteredData: Function
  filters: Array<Filter>
  searchTarget: string
}

interface Filter {
  name: string
  label: string
  options: Array<String>
  target: string
}

const useStyles = makeStyles<Theme>((theme) => ({
  filter: {
    display: 'flex',
    flexFlow: 'row nowrap',
    backgroundColor: theme.palette.grey[100],
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  search: {
    padding: theme.spacing(1, 2),
  },
  filters: {
    marginBottom: theme.spacing(1),
  },
}))

const Filter = ({ data, setFilteredData, filters, searchTarget }: Props) => {
  const classes = useStyles()
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterProperties, setFilterProperties] = React.useState({})

  const { history, location } = useReactRouter()
  const route = Route.getCurrentRoute()
  const urlParams = new URLSearchParams(location.search)

  useEffect(() => {
    const searchTerm = urlParams.get('search')
    if (searchTerm) {
      setSearchTerm(searchTerm)
    }

    filters.map((filter) => {
      const param = urlParams.get(filter.target)
      if (param) {
        filterProperties[filter.target] = param
        setFilterProperties(Object.assign({}, filterProperties))
      }
    })
  }, [data])

  useEffect(() => {
    setFilteredData(getFilteredData(data))
    updateUrlWithParams()
  }, [searchTerm, filterProperties])

  const getFilteredData = (data) => {
    return filterByProperty(filterBySearch(data))
  }

  const updateUrlWithParams = () => {
    const params = {}
    // Add in all other params in the URL
    const hasFilterProperties = Object.entries(filterProperties).length > 0
    urlParams.forEach((value, key) => {
      if (key !== 'search' && hasFilterProperties && !filterProperties.hasOwnProperty(key)) {
        params[key] = value
      }
    })

    Object.assign(params, filterProperties)
    if (!!searchTerm) {
      params['search'] = searchTerm
    }

    const urlWithQueryParams = route.path(params)
    history.push(urlWithQueryParams)
  }

  const filterBySearch = (items) => {
    return items.filter((item) => item[searchTarget].match(new RegExp(searchTerm, 'i')) !== null)
  }

  const filterByProperty = (data) => {
    let filteredData = data
    Object.entries(filterProperties).map(([property, targetValue]) => {
      filteredData = filteredData.filter((data) => {
        return data[property] === targetValue
      })
    })
    return filteredData
  }

  const handleFilterUpdate = (target) => (selectedValue) => {
    if (selectedValue === allKey) {
      delete filterProperties[target]
    } else {
      filterProperties[target] = selectedValue
    }
    setFilterProperties(Object.assign({}, filterProperties))
  }

  return (
    <div className={classes.filter}>
      <div className={classes.filters}>
        {filters.map(({ name, label, options, target }) => (
          <Picklist
            key={name}
            name={name}
            label={label}
            options={options}
            onChange={handleFilterUpdate(target)}
            value={filterProperties[target]}
          />
        ))}
      </div>
      <SearchBar
        className={classes.search}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
    </div>
  )
}

export default Filter
