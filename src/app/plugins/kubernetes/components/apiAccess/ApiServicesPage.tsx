/* eslint-disable no-extra-boolean-cast */
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
import { Dialog } from '@material-ui/core'
import IconButton from 'core/elements/icon-button'

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
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(200px, 300px))',
    gridGap: theme.spacing(2),
    marginTop: theme.spacing(3),
  },
  formFieldCard: {
    paddingTop: 24,
    maxWidth: 1285,
    minHeight: 400,
    display: 'grid',
    justifyContent: 'stretch',
    gridTemplateRows: '40px 60px 1fr',
    gridGap: 16,

    '& > header': {
      margin: 0,
    },
  },
  methods: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, 250px)',
    gridTemplateRows: 'repeat(auto-fill, 80px)',
    gridGap: theme.spacing(1),
  },
  url: {
    marginTop: theme.spacing(1),
  },
  apiDetails: {
    display: 'grid',
    marginTop: theme.spacing(3),
  },
  requestHelper: {
    marginLeft: theme.spacing(2),
    width: '-webkit-fill-available',
  },
  methodCard: {
    width: 'auto',
  },
  closeButton: {
    position: 'absolute',
    top: 30,
    right: 46,
  },
  modalBody: {
    position: 'relative',
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
  const [showApiDialog, setShowApiDialog] = useState(false)

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
  // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
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

  const handleMethodCardClick = (method) => {
    setActiveMethod(method)
    setShowApiDialog(true)
  }
  const onClose = () => {
    setActiveMethod({})
    setShowApiDialog(false)
  }

  return (
    <>
      <div className={classes.apiServicesPage}>
        <div className={classes.serviceCards}>
          {serviceNames.map((name) => (
            <Card
              key={name}
              id={name}
              active={activeApi === name}
              onClick={setActiveApi}
              height={110}
            >
              <Text variant="h5">{ApiServices[name]}</Text>
              <Text variant="caption3" className={classes.url}>
                {getServiceUrl(name)}
              </Text>
            </Card>
          ))}
        </div>
        <div className={classes.apiDetails}>
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
                  onClick={handleMethodCardClick}
                  className={classes.methodCard}
                >
                  <Text variant="body1">{method.name}</Text>
                </Card>
              ))}
            </div>
          </FormFieldCard>
        </div>
        <Dialog
          maxWidth={false}
          open={showApiDialog}
          className={classes.requestHelper}
          onBackdropClick={onClose}
        >
          <div className={classes.modalBody}>
            <IconButton icon="times-circle" onClick={onClose} className={classes.closeButton} />
            <ApiRequestHelper api={activeApi} metadata={activeMethod} />
          </div>
        </Dialog>
      </div>
    </>
  )
}

export default ApiServicesPage
