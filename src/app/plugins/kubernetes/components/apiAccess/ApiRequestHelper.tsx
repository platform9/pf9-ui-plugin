import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import React, { useCallback } from 'react'
import Text from 'core/elements/text'
import TextField from 'core/components/validatedForm/TextField'
import clsx from 'clsx'
import { loadServiceCatalog } from 'openstack/components/api-access/actions'
import { arrToObjByKey } from 'utils/fp'
import useDataLoader from 'core/hooks/useDataLoader'
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

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'column nowrap',
    backgroundColor: theme.components.header.background,
  },
  container: {
    margin: theme.spacing(2),
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
    // margin: theme.spacing(2),
    flexFlow: 'column nowrap',
  },
  textField: {
    backgroundColor: '#FFF',
    marginBottom: theme.spacing(1),
  },
  urlField: {
    minWidth: '100%',
    backgroundColor: '#FFF',
    // margin: theme.spacing(2, 2),
  },
  code: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  parameters: {
    display: 'flex',
    flexFlow: 'column nowrap',
    marginBottom: theme.spacing(2),
  },
}))

const ApiRequestHelper = ({ api, metadata, className = undefined }) => {
  const classes = useStyles()
  const { params, getParamsUpdater } = useParams()
  const [apiResponse, setApiResponse] = React.useState('')
  const apiClient = ApiClient.getInstance()

  const [serviceCatalog] = useDataLoader(loadServiceCatalog)
  const catalogMap = arrToObjByKey('name', serviceCatalog)

  const makeApiRequest = async (inputValues) => {
    let url = metadata.url
    if (metadata.params.length > 0) {
      url = replaceTextBetweenCurlyBraces(url, inputValues)
    }
    const methodName = metadata.name
    let endpoint = catalogMap[api].url
    if (api === 'qbert') {
      endpoint = await apiClient.qbert.getApiEndpoint()
    } else if (api === 'appbert') {
      endpoint = await apiClient.keystone.getEndpoints()
    }

    const response = await apiClient.basicGet({
      url,
      endpoint,
      options: { clsName: api, mthdName: methodName },
    })

    setApiResponse(JSON.stringify(response, null, 2))
  }

  const renderParamField = (param) => {
    if (param === 'clusterUuid') {
      return (
        <PicklistField
          DropdownComponent={ClusterPicklist}
          className={classes.textField}
          id="clusterUuid"
          label="clusterUuid"
          onChange={getParamsUpdater('clusterUuid')}
          value={params.clusterUuid}
          required
        />
      )
    } else {
      return <TextField className={classes.textField} id={param} label={param} required />
    }
  }

  const getRequestUrl = useCallback(() => {
    return pathJoin(catalogMap[api].url, replaceTextBetweenCurlyBraces(metadata.url, params))
  }, [metadata, params])

  return (
    <div className={clsx(classes.root, className)}>
      <div className={classes.container}>
        <div className={classes.header}>
          <Text variant="h3" className={classes.text}>
            {metadata.name}
          </Text>
        </div>
        <div className={classes.container}>
          <ValidatedForm
            classes={{ root: classes.form }}
            elevated={false}
            onSubmit={makeApiRequest}
          >
            <Text className={classes.text} variant="h6">
              URL:
            </Text>
            <TextField
              disabled
              fullWidth
              className={classes.urlField}
              id={'url'}
              label={'URL'}
              value={getRequestUrl()}
            />
            {metadata.params?.length > 0 && (
              <div className={classes.parameters}>
                <Text className={classes.text} variant="h6">
                  Parameters:
                </Text>
                {metadata.params.map((param) => renderParamField(param))}
              </div>
            )}
            <SubmitButton className={classes.button}>Make API Request</SubmitButton>
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
          </ValidatedForm>
        </div>
      </div>
    </div>
  )
}

export default ApiRequestHelper
