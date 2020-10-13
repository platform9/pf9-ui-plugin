import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import endpointsActions from './actions'
import ExternalLink from 'core/components/ExternalLink'
import { qbertApiLink } from 'k8s/links'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { ActionDataKeys } from 'k8s/DataKeys'
import { appUrlRoot } from 'app/constants'
import SimpleLink from 'core/components/SimpleLink'
import { routes } from 'core/utils/routes'

const useStyles = makeStyles((theme) => ({
  blueIcon: {
    color: theme.palette.primary.main,
  },
}))

const EndpointsListPage = () => {
  const classes = useStyles()

  const options = {
    cacheKey: ActionDataKeys.Endpoints,
    uniqueIdentifier: 'name',
    loaderFn: endpointsActions.list,
    columns,
    name: 'API Endpoints',
    showCheckboxes: false,
    compactTable: true,
  }

  const { ListPage } = createCRUDComponents(options)

  return (
    <FormFieldCard
      title="API Endpoints"
      link={
        <div>
          <FontAwesomeIcon className={classes.blueIcon} size="md">
            file-alt
          </FontAwesomeIcon>{' '}
          <ExternalLink url={qbertApiLink}>View Qbert API Swagger Reference</ExternalLink>
        </div>
      }
    >
      <ListPage />
    </FormFieldCard>
  )
}

const renderApiDetailsLink = (api_name, text = '') => {
  return <SimpleLink src={routes.apiDetails.path({ api_name })}>{text}</SimpleLink>
}

const columns = [
  { id: 'name', label: 'Service', render: (value) => renderApiDetailsLink(value, value) },
  { id: 'url', label: 'URL' },
  {
    id: 'apiHelper',
    label: 'API Helper',
    render: (value, { name }) => renderApiDetailsLink(name, 'View API Helper'),
  },
]

export default EndpointsListPage
