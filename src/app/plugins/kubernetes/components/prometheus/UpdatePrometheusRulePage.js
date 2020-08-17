import React from 'react'
import Button from '@material-ui/core/Button'
import PrometheusRuleForm from './PrometheusRuleForm'
import PrometheusRulesTable from './PrometheusRulesTable'
import createUpdateComponents from 'core/helpers/createUpdateComponents'
import uuid from 'uuid'
import { withStyles } from '@material-ui/styles'
import DataKeys from 'k8s/DataKeys'

@withStyles((theme) => ({
  submit: { marginTop: theme.spacing(3) },
}))
class UpdatePrometheusRuleForm extends React.PureComponent {
  state = this.props.initialValues

  handleAddRule = (rule) => {
    const withId = { id: uuid.v4(), ...rule }
    this.setState({ rules: [...this.state.rules, withId] })
  }

  handleDeleteRule = (id) => () => {
    this.setState((state) => ({ rules: state.rules.filter((rule) => rule.id !== id) }))
  }

  handleUpdate = () => {
    this.props.onComplete(this.state)
  }

  render() {
    const { classes } = this.props
    const { rules } = this.state
    return (
      <div>
        <PrometheusRulesTable rules={rules} onDelete={this.handleDeleteRule} />
        <PrometheusRuleForm onSubmit={this.handleAddRule} />
        <Button className={classes.submit} variant="contained" onClick={this.handleUpdate}>
          Update rules
        </Button>
      </div>
    )
  }
}

export const options = {
  FormComponent: UpdatePrometheusRuleForm,
  cacheKey: DataKeys.PrometheusRules,
  routeParamKey: 'id',
  uniqueIdentifier: 'uid',
  listUrl: '/ui/kubernetes/prometheus#rules',
  name: 'UpdatePrometheusRule',
  title: 'Update Prometheus Rule',
}

const { UpdatePage } = createUpdateComponents(options)

export default UpdatePage
