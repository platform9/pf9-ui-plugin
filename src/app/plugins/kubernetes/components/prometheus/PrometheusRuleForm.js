import React from 'react'
import PropTypes from 'prop-types'
import PicklistField from 'core/components/validatedForm/PicklistField'
import SubmitButton from 'core/components/buttons/SubmitButton'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { Card, CardContent, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'

const styles = theme => ({
  root: {
  }
})
const initialValues = {
  severity: 'warning',
}
const severityOptions = 'critical warning info'.split(' ').map(x => ({ value: x, label: x }))

// TODO: Need some UI mechanism to delete a rule.
const PrometheusRuleForm = ({ onDelete, onSubmit, classes }) => {
  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography variant="h6">Prometheus Rule</Typography>
        <ValidatedForm initialValues={initialValues} onSubmit={onSubmit} clearOnSubmit>
          <TextField id="alert" label="Alert Name" info="Name of the alert " />
          <TextField id="expr" label="Rule" info="Prometheus Rule Expression" />
          <PicklistField id="severity" options={severityOptions} label="Severity" info="Severity of the alert" />
          <TextField id="period" label="Period" info="How long rule needs to be true before triggering an alert (Ex: 5m)" />
          <TextField id="description" label="Description" info="Optional description for this rule" />
          <SubmitButton>Add Rule</SubmitButton>
        </ValidatedForm>
      </CardContent>
    </Card>
  )
}

PrometheusRuleForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
}

export default withStyles(styles)(PrometheusRuleForm)
