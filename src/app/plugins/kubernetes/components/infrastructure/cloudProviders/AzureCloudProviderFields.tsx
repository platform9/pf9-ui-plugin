import React from 'react'
import TextField from 'core/components/validatedForm/TextField'
import SubmitButton from 'core/components/buttons/SubmitButton'
import Theme from 'core/themes/model'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles((theme: Theme) => ({
  inCardSubmit: {
    marginTop: theme.spacing(2.5),
  },
}))

interface Props {
  wizardContext: any
  setWizardContext: any
  showSubmitInCard: boolean
  optionalFields: boolean
}

const AzureCloudProviderFields = ({
  wizardContext,
  setWizardContext,
  showSubmitInCard = false,
  optionalFields = false,
}: Props) => {
  const { inCardSubmit } = useStyles({})

  return (
    <>
      <TextField
        id="name"
        label="Name"
        onChange={(value) => setWizardContext({ name: value })}
        value={wizardContext.name}
        info="Name of the cloud provider"
        required={!optionalFields}
      />
      <TextField
        id="tenantId"
        label="Tenant ID"
        onChange={(value) => setWizardContext({ tenantId: value })}
        info="The tenant ID of the service principal"
        required={!optionalFields}
      />
      <TextField
        id="clientId"
        label="Client ID"
        onChange={(value) => setWizardContext({ clientId: value })}
        info="The client ID of the service principal"
        required={!optionalFields}
      />
      <TextField
        id="clientSecret"
        type="password"
        label="Client Secret"
        onChange={(value) => setWizardContext({ clientSecret: value })}
        info="The client secret of the service principal"
        required={!optionalFields}
      />
      <TextField
        id="subscriptionId"
        label="Subscription ID"
        onChange={(value) => setWizardContext({ subscriptionId: value })}
        info="The ID of the subscription that correlates to the service principal"
        required={!optionalFields}
      />
      {showSubmitInCard && (
        <div className={inCardSubmit}>
          <SubmitButton noMargin>Update Cloud Provider</SubmitButton>
        </div>
      )}
    </>
  )
}

export default AzureCloudProviderFields
