import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import endpointsActions from './actions'
import ExternalLink from 'core/components/ExternalLink'
import { qbertApiLink } from 'app/constants'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'

const useStyles = makeStyles(theme => ({
  formWidth: {
    width: 715,
  },
  inputWidth: {
    maxWidth: 350,
  },
  submit: {
    display: 'flex',
    marginLeft: theme.spacing(2),
  },
  blueIcon: {
    color: theme.palette.primary.main
  },
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
    <div className={classes.formWidth}>
      <FormFieldCard
        title="API Endpoints"
        link={
          <div>
            <FontAwesomeIcon className={classes.blueIcon} size="md">file-alt</FontAwesomeIcon>{' '}
            <ExternalLink url={qbertApiLink}>Want to know more about Qbert?</ExternalLink>
          </div>
        }
      >
        <ListPage />
      </FormFieldCard>
    </div>
  )
}

const columns = [
  { id: 'name', label: 'Service' },
  { id: 'type', label: 'Type' },
  { id: 'url', label: 'URL' },
]

export default EndpointsListPage
