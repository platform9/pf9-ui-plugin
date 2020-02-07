import React from 'react'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import SubmitButton from 'core/components/SubmitButton'
import ExternalLink from 'core/components/ExternalLink'
import { makeStyles } from '@material-ui/styles'
import { azurePrerequisitesLink } from 'k8s/links'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'

const useStyles = makeStyles((theme) => ({
  blueIcon: {
    color: theme.palette.primary.main,
  },
}))

const initialValues = {
  type: 'azure',
}

const AddAzureCloudProvider = ({ onComplete }) => {
  const classes = useStyles()
  return (
    <>
      <ValidatedForm
        onSubmit={onComplete}
        initialValues={initialValues}
        formActions={<SubmitButton>Add Cloud Provider</SubmitButton>}
        title="Create Azure Cloud Provider"
        link={
          <div>
            <FontAwesomeIcon className={classes.blueIcon} size="md">
              file-alt
            </FontAwesomeIcon>
            <ExternalLink url={azurePrerequisitesLink}>
              Need help setting up an Azure provider?
            </ExternalLink>
          </div>
        }>
          <TextField required id="name" label="Name" info="Name of the cloud provider" />
          <TextField
            required
            id="tenantId"
            label="Tenant ID"
            info="The tenant ID of the service principal"
          />
          <TextField
            required
            id="clientId"
            label="Client ID"
            info="The client ID of the service principal"
          />
          <TextField
            required
            id="clientSecret"
            type="password"
            label="Client Secret"
            info="The client secret of the service principal"
          />
          <TextField
            required
            id="subscriptionId"
            label="Subscription ID"
            info="The ID of the subscription that correlates to the service principal."
          />
      </ValidatedForm>
    </>
  )
}

export default AddAzureCloudProvider
