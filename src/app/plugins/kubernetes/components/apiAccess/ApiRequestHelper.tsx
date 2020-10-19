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
    display: 'flex',
    flexFlow: 'column nowrap',
    backgroundColor: theme.components.header.background,
  },
  container: {
    margin: theme.spacing(2),
    display: 'flex',
    flexFlow: 'column nowrap',
  },
  request: {
    display: 'flex',
    flexFlow: 'column nowrap',
  },
  header: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
  },
  text: {
    color: '#FFF',
    marginBottom: theme.spacing(2),
  },
  button: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  form: {
    flexFlow: 'column nowrap',
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
        GET: () => apiClient.basicGet(params),
        POST: () => apiClient.basicPost(params),
        PATCH: () => apiClient.basicPatch(params),
        PUT: () => apiClient.basicPut(params),
        DELETE: () => apiClient.basicDelete(params),
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
      <div className={classes.container}>
        <div className={classes.header}>
          <Text variant="h3" className={classes.text}>
            {metadata.name}
          </Text>
        </div>
        <div className={classes.container}>
          <ValidatedForm classes={{ root: classes.form }} elevated={false} onSubmit={handleSubmit}>
            <Text className={classes.text} variant="h6">
              URL:
            </Text>
            <TextField
              disabled
              fullWidth
              className={classes.urlField}
              id={'url'}
              label={'URL'}
              value={requestUrl}
            />
            {metadata.params?.length > 0 && (
              <div className={classes.parameters}>
                <Text className={classes.text} variant="h6">
                  Parameters:
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
                <CodeMirror
                  id="jsonResponse"
                  label={
                    <CopyToClipboard copyText={apiResponse} inline={true}>
                      JSON Response
                    </CopyToClipboard>
                  }
                  value={apiResponse}
                  options={{ mode: 'json' }}
                ></CodeMirror>
              </div>
            )}
          </ValidatedForm>
        </div>
      </div>
    </div>
  )
}

export default ApiRequestHelper
