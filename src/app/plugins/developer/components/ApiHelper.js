import React from 'react'
import JsonView from 'react-json-view'
import PicklistField from 'core/components/validatedForm/PicklistField'
import TextField from 'core/components/validatedForm/TextField'
import SubmitButton from 'core/components/SubmitButton'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import ListTable from 'core/components/listTable/ListTable'
import {
  Checkbox, FormControlLabel, TextField as BaseTextField, Typography
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import { path, pick } from 'ramda'
import { compose } from 'core/../../../utils/fp'
import { withAppContext } from 'core/AppContext'
import createFormComponent from 'core/helpers/createFormComponent'
import ServicePicker from './ServicePicker'
import { withScopedPreferences } from 'core/PreferencesProvider'

const methodsWithBody = ['POST', 'PUT', 'PATCH']

const styles = theme => ({
  root: {
    width: '100%',
  }
})

class ApiHelper extends React.Component {
  state = {
    baseUrl: '',
    body: {},
    method: '',
    response: null,
    service: '',
    url: '',
    responseLens: '',
    fieldMappings: {},
    formMappings: {},
  }

  componentDidMount () {
    // TODO: Save the last developer API call in the AppContext to save
    // repetition.
    /*
    this.performApiCall({
      method: 'GET',
      url: 'https://pf9-kvm-neutron.platform9.net/nova/v2.1/f175f441ebbb4c2b8fedf6469d6415fc/flavors/detail',
    })
    */
  }

  performApiCall = async ({ method, url, body }) => {
    const { baseUrl } = this.state
    const { apiClient } = this.props.context
    const finalUrl = baseUrl + url

    const response = await {
      GET:    () => apiClient.basicGet(finalUrl),
      POST:   () => apiClient.basicPost(finalUrl, JSON.parse(body)),
      PUT:    () => apiClient.basicPut(finalUrl, JSON.parse(body)),
      DELETE: () => apiClient.basicGet(finalUrl),
    }[method]()

    this.setState({ response })
  }

  setField = key => value => this.setState({ [key]: value })

  handleServiceChange = async ({ service, baseUrl }) => {
    const { apiClient } = this.props.context
    this.setState({ service })

    if (service === 'qbert') {
      return this.setState({ baseUrl: await apiClient.qbert.baseUrl() })
    }
    this.setState({ baseUrl })
  }

  toggleFieldSelection = field => e => {
    const { fieldMappings } = this.state
    this.setState({
      fieldMappings: {
        ...fieldMappings,
        [field]: {
          ...(fieldMappings[field] || {}),
          selected: e.target.checked,
        }
      }
    })
  }

  toggleFormFieldSelection = field => e => {
    const { formMappings } = this.state
    this.setState({
      formMappings: {
        ...formMappings,
        [field]: {
          ...(formMappings[field] || {}),
          selected: e.target.checked,
        }
      }
    })
  }

  renderResponse = () => {
    const { response } = this.state
    if (!response) { return null }
    return (
      <div>
        <Typography variant="subtitle1">Response</Typography>
        <br />
        <JsonView src={response} collapsed={1} />
      </div>
    )
  }

  renderResponseLens = () => {
    const { response, responseLens } = this.state
    if (!response) { return null }
    const lensResult = path(responseLens.split('.'), response)
    return (
      <div>
        <br />
        <Typography variant="body2">Choose a lens ('.' separated) path to drill into the actual data.  E.g., "data.itemType.0"</Typography>
        <BaseTextField
          id="responseLens"
          label="Response path lens"
          value={this.state.responseLens}
          onChange={e => this.setField('responseLens')(e.target.value)}
          fullWidth
        />
        {lensResult && <JsonView src={lensResult} collapsed={1} />}
      </div>
    )
  }

  // TODO: It might be more convenient to have 1 row per API response field and have multiple columns
  // for configuring the different concerns (table, form, simulator).  Also, separate this out into
  // its own component.  This was rushed for the Hackathon.
  renderFieldSelection = () => {
    const { response, responseLens, fieldMappings } = this.state
    if (!response) { return null }
    const lensResult = path(responseLens.split('.'), response)
    if (!lensResult) { return null }
    const fields = Object.keys(lensResult)
    return (
      <div>
        <br />
        <Typography variant="body1">Choose the fields you want to include in the table</Typography>
        {fields.map(field => {
          return (
            <div key={field} style={{ display: 'flex' }}>
              <div>
                <FormControlLabel
                  label={field}
                  control={
                    <Checkbox checked={(fieldMappings[field] || {}).selected} onChange={this.toggleFieldSelection(field)} />
                  }
                />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  renderTablePreview = () => {
    const { response, responseLens, fieldMappings } = this.state
    const {
      preferences: { visibleColumns, columnsOrder, rowsPerPage },
      updatePreferences
    } = this.props
    if (!response) { return null }
    const tableLens = responseLens.split('.').slice(0, -1)
    const lensResult = path(tableLens, response)
    if (!lensResult) { return null }
    const columns =
      Object.keys(fieldMappings)
        .filter(field => !!fieldMappings[field].selected)
        .map(field => ({ id: field, label: field }))
    if (!columns || columns.length === 0) { return null }
    return (
      <div>
        <ListTable
          title="Table Preview"
          columns={columns}
          data={lensResult}
          visibleColumns={visibleColumns}
          columnsOrder={columnsOrder}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={rowsPerPage => updatePreferences({ rowsPerPage })}
          onColumnsChange={updatePreferences}
        />
        <br />
        <Typography variant="body1">Here's the table spec you can use in your code:</Typography>
        <br />
        <pre>{JSON.stringify(columns, null, 4)}</pre>
      </div>
    )
  }

  renderFormFieldSelection = () => {
    const { response, responseLens, formMappings } = this.state
    if (!response) { return null }
    const lensResult = path(responseLens.split('.'), response)
    if (!lensResult) { return null }
    const fields = Object.keys(lensResult)
    return (
      <div>
        <br />
        <Typography variant="body1">Choose the fields you want to include in the form</Typography>
        {fields.map(field => {
          return (
            <div key={field} style={{ display: 'flex' }}>
              <div>
                <FormControlLabel
                  label={field}
                  control={
                    <Checkbox checked={(formMappings[field] || {}).selected} onChange={this.toggleFormFieldSelection(field)} />
                  }
                />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  renderFormPreview = () => {
    const { response, responseLens, formMappings } = this.state
    if (!response) { return null }
    const lensResult = path(responseLens.split('.'), response)
    if (!lensResult) { return null }
    const columns =
      Object.keys(formMappings)
        .filter(field => !!formMappings[field].selected)
        .map(field => ({ id: field, label: field }))
    if (!columns || columns.length === 0) { return null }
    const determineType = key => {
      const datum = lensResult[key]
      if (Number.isInteger(datum)) { return 'number' }
      if (datum === true || datum === false) { return 'boolean' }
      return 'string'
    }
    const fields = columns.map(x => ({ key: x.id, type: 'string' }))
    if (!fields || fields.length === 0) { return null }
    const initialValue = Object.keys(formMappings).reduce(
      (accum, key) => {
        accum[key] = lensResult[key]
        return accum
      },
      {}
    )
    const Form = createFormComponent({
      submitLabel: 'submit mock form field',
      initialValue,
      fields: columns.map(x => ({ id: x.id, key: x.id, label: x.id, type: determineType(x.id) }))
    })
    return (
      <div>
        <Form />
        <br />
        <Typography variant="body1">Here's the "fields" for your formSpec you can use in your code:</Typography>
        <br />
        <pre>{JSON.stringify(columns, null, 4)}</pre>
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

    // TODO: We might want to extend this to support custom headers and better
    // editing of the body.
    return (
      <div className={classes.root}>
        <ValidatedForm
          onSubmit={this.performApiCall}
          className={classes.root}
          initialValues={initialValue}
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
        {this.renderResponseLens()}
        {this.renderFieldSelection()}
        {this.renderTablePreview()}
        {this.renderFormFieldSelection()}
        {this.renderFormPreview()}
      </div>
    )
  }
}

export default compose(
  withAppContext,
  withScopedPreferences('ApiHelper'),
  withStyles(styles),
)(ApiHelper)
