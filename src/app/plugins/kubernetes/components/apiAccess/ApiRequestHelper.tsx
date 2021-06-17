import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import React, { useState, useEffect } from 'react'
import Text from 'core/elements/text'
import TextField from 'core/components/validatedForm/TextField'
import clsx from 'clsx'
import { loadServiceCatalog } from 'openstack/components/api-access/actions'
import { arrToObjByKey } from 'utils/fp'
import ApiClient from 'api-client/ApiClient'
import CodeMirror from 'core/components/validatedForm/CodeMirror'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import CopyToClipboard from 'core/components/CopyToClipboard'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { pathJoin } from 'utils/misc'
import { replaceTextBetweenCurlyBraces } from 'api-client/helpers'
import PicklistField from 'core/components/validatedForm/PicklistField'
import ClusterPicklist from '../common/ClusterPicklist'
import useParams from 'core/hooks/useParams'
import CloudProviderPicklist from '../common/CloudProviderPicklist'
import { ErrorMessage } from 'core/components/validatedForm/ErrorMessage'

const methodsWithBody = ['POST', 'PUT', 'PATCH']

const useStyles = makeStyles<Theme>((theme) => ({
  apiRequestHelper: {
    width: '90vw',
    height: '80vh',
    display: 'grid',
    gridTemplateRows: '75px 1fr',
  },
  container: {
    margin: theme.spacing(2, 6, 3, 6),
    display: 'grid',
    alignContent: 'stretch',
  },
  request: {
    display: 'flex',
    flexFlow: 'column nowrap',
  },
  header: {
    borderBottom: `1px solid ${theme.palette.grey[500]}`,
    margin: '24px 32px 0 32px',
    paddingLeft: 16,
  },
  text: {
    color: theme.palette.grey[900],
  },
  breakWord: {
    wordBreak: 'break-all',
  },
  titleBreak: {
    marginTop: 16,
  },
  button: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  form: {
    display: 'grid',
    gridTemplateColumns: '375px 1fr',
    gridTemplateRows: '1fr',
    alignContent: 'stretch',
    justifyContent: 'stretch',
    gridGap: 16,

    [theme.breakpoints.down(890)]: {
      gridTemplateColumns: 'auto',
      gridTemplateRows: 'max-content 1fr',
    },

    '& #jsonResponse': {
      display: 'grid',
      gridTemplateRows: 'max-content 1fr',
      alignContent: 'stretch',
      justifyContent: 'stretch;',
    },
    '& #jsonResponse .CodeMirror': {
      height: 'calc(80vh - 180px)',
      [theme.breakpoints.down(890)]: {
        height: '500px',
      },
    },
  },
  textField: {
    backgroundColor: '#FFF',
    marginBottom: theme.spacing(1),
  },
  urlField: {
    minWidth: '100%',
    backgroundColor: '#FFF',
  },
  parameters: {
    display: 'flex',
    flexFlow: 'column nowrap',
    marginBottom: theme.spacing(2),

    '& .validatedFormInput': {
      width: '100% !important',
    },
  },
}))

const renderParamField = ({ classes, paramName, params, getParamsUpdater }) => {
  if (paramName === 'clusterUuid') {
    return (
      <PicklistField
        key={paramName}
        DropdownComponent={ClusterPicklist}
        className={classes.textField}
        id="clusterUuid"
        label="clusterUuid"
        onChange={getParamsUpdater('clusterUuid')}
        value={params.clusterUuid}
        required
      />
    )
  } else if (paramName === 'cloudProviderUuid') {
    return (
      <PicklistField
        key={paramName}
        DropdownComponent={CloudProviderPicklist}
        className={classes.textField}
        id="cloudProviderUuid"
        label="cloudProviderUuid"
        onChange={getParamsUpdater('cloudProviderUuid')}
        value={params.cloudProviderUuid}
        required
      />
    )
  } else {
    return (
      <TextField
        key={paramName}
        className={classes.textField}
        id={paramName}
        label={paramName}
        onChange={getParamsUpdater(paramName)}
        required
      />
    )
  }
}

const ApiRequestHelper = ({ api, metadata, className = undefined }) => {
  const classes = useStyles()
  const devEnabled = window.localStorage.enableDevPlugin === 'true'
  const { params, getParamsUpdater } = useParams()
  const [apiResponse, setApiResponse] = useState('')
  const [requestUrl, setRequestUrl] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const apiClient = ApiClient.getInstance()

  const isGetRequest = !methodsWithBody.includes(metadata.type) && metadata.type !== 'DELETE'
  const enableRequest = devEnabled || (!devEnabled && isGetRequest)

  useEffect(() => {
    setApiResponse('')
    setErrorMessage('')

    const setUrl = async () => {
      let serviceEndpoint = ''
      if (api === 'qbert') {
        serviceEndpoint = await apiClient.qbert.getApiEndpoint()
      } else {
        const serviceCatalog = await loadServiceCatalog()
        const catalogMap = arrToObjByKey('name', serviceCatalog)
        serviceEndpoint = catalogMap[api].url
      }
      const endpoint = replaceTextBetweenCurlyBraces(metadata.url, params)
      const url = pathJoin(serviceEndpoint, endpoint)
      setRequestUrl(url)
    }

    if (metadata?.url) setUrl()
  }, [metadata, params])

  const makeApiRequest = async (url, endpoint, body = '') => {
    const params = {
      url,
      endpoint,
      options: {
        clsName: api,
        mthdName: metadata.name,
      },
    }
    if (methodsWithBody.includes(metadata.type)) {
      params[body] = body
    }
    try {
      const response = await {
        GET: async () => apiClient.basicGet(params),
        POST: async () => apiClient.basicPost(params),
        PATCH: async () => apiClient.basicPatch(params),
        PUT: async () => apiClient.basicPut(params),
        DELETE: async () => apiClient.basicDelete(params),
      }[metadata.type]()

      return response
    } catch (e) {
      typeof e === 'object' ? setErrorMessage(e.message) : setErrorMessage('Request Failed')
      return null
    }
  }

  const handleSubmit = async ({ body, ...inputValues }) => {
    let url = metadata.url
    if (metadata.params.length > 0) {
      url = replaceTextBetweenCurlyBraces(url, inputValues)
    }

    const response = await makeApiRequest(url, body)
    if (response) {
      setApiResponse(JSON.stringify(response, null, 2))
    }
  }

  return (
    <div className={clsx(classes.apiRequestHelper, className)}>
      <header className={classes.header}>
        <Text variant="h3" className={classes.text}>
          {metadata.name}
        </Text>
      </header>
      <div className={classes.container}>
        <ValidatedForm classes={{ root: classes.form }} elevated={false} onSubmit={handleSubmit}>
          <div>
            <Text className={classes.text} variant="subtitle1">
              Request URL
            </Text>
            <Text
              className={clsx(classes.text, classes.breakWord)}
              component="span"
              variant="body2"
            >
              {requestUrl}
            </Text>
            {metadata.params?.length > 0 && (
              <div className={classes.parameters}>
                <Text className={clsx(classes.text, classes.titleBreak)} variant="subtitle1">
                  Request Parameters
                </Text>
                {metadata.params.map((paramName) =>
                  renderParamField({ classes, paramName, params, getParamsUpdater }),
                )}
              </div>
            )}
            {methodsWithBody.includes(metadata.type) && devEnabled && (
              <TextField className={classes.textField} id="body" label="Body" multiline rows={3} />
            )}
            {enableRequest && (
              <div className={classes.request}>
                <SubmitButton className={classes.button}>Make API Request</SubmitButton>
                {!!errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
              </div>
            )}
          </div>
          {enableRequest && (
            <CodeMirror
              id="jsonResponse"
              label={
                <CopyToClipboard copyText={apiResponse} inline>
                  JSON Response
                </CopyToClipboard>
              }
              value={apiResponse}
              options={{ mode: 'json' }}
            />
          )}
        </ValidatedForm>
      </div>
    </div>
  )
}

export default ApiRequestHelper
