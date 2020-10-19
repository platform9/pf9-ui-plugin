import React, { useCallback, useEffect, useState } from 'react'
import useReactRouter from 'use-react-router'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadServiceCatalog } from 'openstack/components/api-access/actions'
import { pluck } from 'ramda'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import { ApiServices } from 'api-client/model'
import Filter from 'core/components/Filter'
import Appbert from 'api-client/Appbert'
import Keystone from 'api-client/Keystone'
import Qbert from 'api-client/Qbert'
import ResMgr from 'api-client/ResMgr'
import Card from 'core/components/Card'
import Text from 'core/elements/text'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import ApiRequestHelper from './ApiRequestHelper'
import { Route } from 'core/utils/routes'

const searchTarget = 'name'
const requestVerbs = ['GET', 'PATCH', 'PUT', 'POST', 'DELETE']

const filters: Filter[] = [
  {
    name: 'Verb',
    label: 'Verb',
    options: requestVerbs,
    target: 'type',
  },
]

const useStyles = makeStyles<Theme>((theme) => ({
  apiServicesPage: {
    display: 'flex',
    flexFlow: 'column nowrap',
    minWidth: 'maxContent',
  },
  serviceCards: {
    display: 'flex',
    flexFlow: 'row nowrap',
    marginTop: theme.spacing(2),
  },
  formFieldCard: {
    maxWidth: 'inherit',
  },
  methods: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 250px)',
    gridGap: theme.spacing(1),
    marginTop: theme.spacing(3),
  },
  url: {
    marginTop: theme.spacing(1),
  },
  apiDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    marginTop: theme.spacing(3),
  },
  requestHelper: {
    marginLeft: theme.spacing(2),
    width: '-webkit-fill-available',
  },
  methodCard: {
    width: 'auto',
  },
}))

const apiServices = {
  appbert: Appbert,
  keystone: Keystone,
  qbert: Qbert,
  resmgr: ResMgr,
}

const ApiServicesPage = () => {
  const classes = useStyles()
  const [activeApi, setActiveApi] = useState('')
  const [apiMethods, setApiMethods] = useState([])
  const [activeMethod, setActiveMethod] = useState({})

  const { history, location } = useReactRouter()
  const route = Route.getCurrentRoute()
  const urlParams = new URLSearchParams(location.search)

  const devEnabled = window.localStorage.enableDevPlugin === 'true'
  const [serviceCatalog] = useDataLoader(loadServiceCatalog)
  let whitelist = ['keystone', 'qbert']

  // Only expose these services in the dev plugin
  const devOnlyServices = ['appbert', 'resmgr']
  if (devEnabled) {
    whitelist = whitelist.concat(devOnlyServices)
  }

  const services = serviceCatalog.filter((service) => whitelist.includes(service.name))
  const serviceNames = pluck('name', services).sort()

  useEffect(() => {
    const apiName = urlParams.get('api')
    if (!!apiName) {
      setActiveApi(urlParams.get('api'))
    } else {
      if (serviceNames.length > 0) {
        setActiveApi(serviceNames[0])
      }
    }
  }, [])

  useEffect(() => {
    if (!!activeApi) {
      const methods = apiServices[activeApi].apiMethodsMetadata
      setApiMethods(methods)
      setActiveMethod({})
      updateUrlWithParams()
    }
  }, [activeApi])

  const updateUrlWithParams = () => {
    const params = { api: activeApi }
    // Add in all other params in the URL
    urlParams.forEach((value, key, parent) => {
      if (key !== 'api') params[key] = value
    })
    const urlWithQueryParams = route.path(params)
    history.push(urlWithQueryParams)
  }

  const getServiceUrl = (name) => {
    return services.find((service) => service.name === name).url
  }

  const getAllApiMethods = useCallback(() => {
    if (!activeApi) {
      return []
    }
    return apiServices[activeApi].apiMethodsMetadata
  }, [activeApi])

  return (
    <div className={classes.apiServicesPage}>
      <div className={classes.serviceCards}>
        {serviceNames.map((name) => (
          <Card key={name} id={name} active={activeApi === name} onClick={setActiveApi}>
            <Text variant="h5">{ApiServices[name]}</Text>
            <Text variant="caption3" className={classes.url}>
              {getServiceUrl(name)}
            </Text>
          </Card>
        ))}
      </div>
      <div className={classes.apiDetails}>
        <div>
          <FormFieldCard title="Request Methods" className={classes.formFieldCard}>
            <Filter
              data={getAllApiMethods()}
              setFilteredData={setApiMethods}
              filters={filters}
              searchTarget={searchTarget}
            />
            <div className={classes.methods}>
              {apiMethods.map((method) => (
                <Card
                  key={method.name}
                  id={method}
                  active={false}
                  onClick={setActiveMethod}
                  className={classes.methodCard}
                >
                  <Text variant="body1">{method.name}</Text>
                </Card>
              ))}
            </div>
          </FormFieldCard>
        </div>
        <div className={classes.requestHelper}>
          <ApiRequestHelper api={activeApi} metadata={activeMethod}></ApiRequestHelper>
        </div>
      </div>
    </div>
  )
}

export default ApiServicesPage
