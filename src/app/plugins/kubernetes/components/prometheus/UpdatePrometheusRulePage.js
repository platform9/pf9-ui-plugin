import React from 'react'
import createUpdateComponents from 'core/helpers/createUpdateComponents'
import SubmitButton from 'core/components/SubmitButton'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import { loadPrometheusRules, updatePrometheusRule } from './actions'

export const UpdatePrometheusRuleForm = ({ onComplete, initialValue }) => (
  <ValidatedForm onSubmit={onComplete} initialValues={initialValue}>
    <TextField id="name" label="Name" />
    <SubmitButton>Update Rule</SubmitButton>
  </ValidatedForm>
)

export const options = {
  FormComponent: UpdatePrometheusRuleForm,
  routeParamKey: 'id',
  uniqueIdentifier: 'uid',
  updateFn: updatePrometheusRule,
  loaderFn: loadPrometheusRules,
  listUrl: '/ui/kubernetes/prometheus#rules',
  name: 'UpdatePrometheusRule',
  title: 'Update Prometheus Rule',
}

const { UpdatePage } = createUpdateComponents(options)

export default UpdatePage
