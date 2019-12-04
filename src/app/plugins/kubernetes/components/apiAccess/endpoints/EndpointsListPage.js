import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import endpointsActions from './actions'
import ExternalLink from 'core/components/ExternalLink'

const useStyles = makeStyles(theme => ({
  link: {
    display: 'block',
    width: 'fit-content',
    marginTop: theme.spacing(5),
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
      <ExternalLink className={classes.link} url="https://docs.platform9.com/kubernetes/Qbert-API-Reference">See qbert API Documentation</ExternalLink>
    </>
  )
}

const columns = [
  { id: 'name', label: 'Service' },
  { id: 'type', label: 'Type' },
  { id: 'url', label: 'URL' },
]

export default EndpointsListPage
