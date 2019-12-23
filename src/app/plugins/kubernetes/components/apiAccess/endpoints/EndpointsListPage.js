import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import endpointsActions from './actions'
import ExternalLink from 'core/components/ExternalLink'
import { qbertApiLink } from 'app/constants'

const useStyles = makeStyles(theme => ({
  container: {
    marginBottom: theme.spacing(3),
  },
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
    <section className={classes.container}>
      <h2>API Endpoints</h2>
      <ListPage />
      <ExternalLink className={classes.link} url={qbertApiLink}>See Qbert API documentation</ExternalLink>
    </section>
  )
}

const columns = [
  { id: 'name', label: 'Service' },
  { id: 'type', label: 'Type' },
  { id: 'url', label: 'URL' },
]

export default EndpointsListPage
