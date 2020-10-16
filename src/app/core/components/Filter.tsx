import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import React, { useEffect } from 'react'
<<<<<<< HEAD
import useReactRouter from 'use-react-router'
=======
>>>>>>> 2a8312c32ed3addd9789ca8c29b7a16fbc25b6b2
import PicklistDefault from 'core/components/Picklist'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.
import SearchBar from './SearchBar'
import { assocPath } from 'ramda'
import { allKey } from 'app/constants'
<<<<<<< HEAD
import { Route } from 'core/utils/routes'
=======
>>>>>>> 2a8312c32ed3addd9789ca8c29b7a16fbc25b6b2

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

<<<<<<< HEAD
  const { history, location } = useReactRouter()
  const url = Route.getCurrentRoute().url
  const route = new Route({ url, name: 'Filter' })

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const searchTerm = searchParams.get('search')
    if (searchTerm) {
      setSearchTerm(searchTerm)
    }

    filters.map((filter) => {
      const param = searchParams.get(filter.target)
      if (param) {
        setFilterProperties(assocPath([filter.target], param))
      }
    })
  }, [data])

  useEffect(() => {
    const filteredData = filterByProperty(filterBySearch(data))
    setFilteredData(filteredData)
    updateUrlWithParams()
  }, [searchTerm, filterProperties])

  const updateUrlWithParams = () => {
    const params = Object.assign({}, filterProperties)
    if (!!searchTerm) {
      params['search'] = searchTerm
    }
    const urlWithQueryParams = route.path(params)
    history.push(urlWithQueryParams)
  }

=======
  useEffect(() => {
    const filteredData = filterByProperty(filterBySearch(data))
    setFilteredData(filteredData)
  }, [searchTerm, filterProperties])

>>>>>>> 2a8312c32ed3addd9789ca8c29b7a16fbc25b6b2
  const filterBySearch = (data) => {
    return data.filter((data) => data[searchTarget].match(new RegExp(searchTerm, 'i')) !== null)
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
      setFilterProperties(delete filterProperties[target])
    } else {
      setFilterProperties(assocPath([target], selectedValue))
    }
  }

  return (
    <div className={classes.filter}>
      <div className={classes.filters}>
        {filters.map(({ name, label, options, target }) => (
          <Picklist
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
