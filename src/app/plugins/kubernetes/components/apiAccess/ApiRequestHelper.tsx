import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import React from 'react'
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
  const [apiResponse, setApiResponse] = React.useState('')

  const [serviceCatalog] = useDataLoader(loadServiceCatalog)
  const catalogMap = arrToObjByKey('name', serviceCatalog)

  const makeApiRequest = async () => {
    const apiClient = ApiClient.getInstance()
    const url = metadata.url
    let endpoint = catalogMap[api].url
    const methodName = metadata.name

    if (api === 'qbert') {
      endpoint = await apiClient.qbert.getApiEndpoint()
    }

    const response = await apiClient.basicGet({
      url,
      endpoint,
      options: { clsName: api, mthdName: methodName },
    })

    setApiResponse(JSON.stringify(response, null, 2))
  }

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
              value={pathJoin(catalogMap[api].url, metadata.url)}
            />
            {metadata.params?.length > 0 && (
              <div className={classes.parameters}>
                <Text className={classes.text} variant="h6">
                  Parameters:
                </Text>
                {metadata.params.map((param) => (
                  <TextField className={classes.textField} id={param} label={param} />
                ))}
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
