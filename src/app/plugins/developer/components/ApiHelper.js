import React from 'react'
import JsonView from 'react-json-view'
import DataLoader from 'core/DataLoader'
import PicklistField from 'core/common/PicklistField'
import TextField from 'core/common/TextField'
import SubmitButton from 'core/common/SubmitButton'
import ValidatedForm from 'core/common/ValidatedForm'
import { TextField as BaseTextField, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import { pick } from 'ramda'
import { compose } from 'core/fp'
import { withAppContext } from 'core/AppContext'
import { loadServiceCatalog } from 'openstack/components/api-access/actions'
import ServicePicker from './ServicePicker'

const methodsWithBody = ['POST', 'PUT', 'PATCH']

const styles = theme => ({
  root: {
    width: '100%',
  }
})

class ApiViewer extends React.Component {
  state = {
    baseUrl: '',
    body: {},
    method: 'GET',
    response: null,
    service: '',
    url: '',
  }

  performApiCall = async ({ method, url, body }) => {
    const { baseUrl } = this.state
    console.log('performApiCall')
    const { apiClient } = this.props.context
    const finalUrl = baseUrl + url
    console.log(finalUrl)

    const response = await {
      GET:    () => apiClient.basicGet(finalUrl),
      POST:   () => apiClient.basicPost(finalUrl, body),
      PUT:    () => apiClient.basicPut(finalUrl, body),
      DELETE: () => apiClient.basicGet(finalUrl),
    }[method]()

    console.log(response)
    this.setState({ response })
  }

  setField = key => value => this.setState({ [key]: value })

  handleServiceChange = ({ service, baseUrl }) => {
    this.setState({ service, baseUrl })
  }

  renderResponse = () => {
    const { response } = this.state
    if (!response) { return null }
    return (
      <div>
        <Typography variant="subheading">Response</Typography>
        <br />
        <JsonView src={response} collapsed={1} />
      </div>
    )
  }

  render () {
    const { classes } = this.props

    // This needs to be done in render because it needs values from DataLoader.
    const initialValue = pick(
      [ 'baseUrl', 'method', 'service' ],
      this.state
    )

    const { baseUrl, method, service } = this.state

    return (
      <DataLoader dataKey="serviceCatalog" loaderFn={loadServiceCatalog}>
        {({ data }) =>
          <div className={classes.root}>
            <ValidatedForm
              onSubmit={this.performApiCall}
              classes={classes.root}
              initialValue={initialValue}
            >
              <ServicePicker value={service} onChange={this.handleServiceChange} />
              <PicklistField
                id="method"
                label="HTTP Verb"
                options={['GET', 'POST', 'PUT', 'PATCH', 'DELETE']}
                onChange={this.setField('method')}
              />
              <BaseTextField
                id="baseUrl"
                label="Base URL"
                value={baseUrl}
                onChange={e => this.setField('baseUrl')(e.target.value)}
                fullWidth
              />
              <TextField id="url" label="URL" />
              {methodsWithBody.includes(method) &&
                <TextField id="body" label="Body" multiline rows={3} />
              }
              <SubmitButton>Make API Call</SubmitButton>
            </ValidatedForm>
            {this.renderResponse()}
          </div>
        }
      </DataLoader>
    )
  }
}

export default compose(
  withAppContext,
  withStyles(styles),
)(ApiViewer)
