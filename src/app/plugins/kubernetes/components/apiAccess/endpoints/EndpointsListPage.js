import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import endpointsActions from './actions'

const useStyles = makeStyles(theme => ({
  link: {
    display: 'block',
    width: 'fit-content',
    marginTop: theme.spacing(5),
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    }
  }
}))

const EndpointsListPage = () => {
  const classes = useStyles()

  const options = {
    cacheKey: 'endpoints',
    uniqueIdentifier: 'name',
    loaderFn: endpointsActions.list,
    columns,
    name: 'API Endpoints',
    showCheckboxes: false,
    compactTable: true,
  }

  const { ListPage } = createCRUDComponents(options)

  return (
    <>
      <h2>API Endpoints</h2>
      <ListPage />
      <a className={classes.link} href="/clarity/docs/qbert/">See qbert API Documentation</a>
    </>
  )
}

const columns = [
  { id: 'name', label: 'Service' },
  { id: 'type', label: 'Type' },
  { id: 'url', label: 'URL' },
]

export default EndpointsListPage
