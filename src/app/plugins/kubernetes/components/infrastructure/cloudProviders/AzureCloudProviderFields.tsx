import React from 'react'
import TextField from 'core/components/validatedForm/TextField'
import Button from 'core/elements/button'
import Theme from 'core/themes/model'
import { makeStyles } from '@material-ui/styles'
import { ErrorMessage } from 'core/components/validatedForm/ErrorMessage'

const useStyles = makeStyles((theme: Theme) => ({
  inCardSubmit: {
    marginTop: theme.spacing(2.5),
  },
}))

interface Props {
  wizardContext: any
  setWizardContext: any
  showSubmitInCard: boolean
  updateWizard: boolean
  errorMessage: string
}

const AzureCloudProviderFields = ({
  wizardContext,
  setWizardContext,
  showSubmitInCard = false,
  updateWizard = false,
  errorMessage = '',
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
        disabled={updateWizard}
        required
      />
      <TextField
        id="tenantId"
        label="Tenant ID"
        onChange={(value) => setWizardContext({ tenantId: value })}
        info="The tenant ID of the service principal"
        disabled={updateWizard}
        required
      />
      <TextField
        id="clientId"
        label="Client ID"
        onChange={(value) => setWizardContext({ clientId: value })}
        info="The client ID of the service principal"
        disabled={updateWizard}
        required
      />
      <TextField
        id="clientSecret"
        type="password"
        label="Client Secret"
        onChange={(value) => setWizardContext({ clientSecret: value })}
        info="The client secret of the service principal"
        disabled={updateWizard}
        required
      />
      <TextField
        id="subscriptionId"
        label="Subscription ID"
        onChange={(value) => setWizardContext({ subscriptionId: value })}
        info="The ID of the subscription that correlates to the service principal"
        disabled={updateWizard}
        required
      />
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {showSubmitInCard && (
        <div className={inCardSubmit}>
          <Button disabled type="submit">
            Update Cloud Provider
          </Button>
        </div>
      )}
    </>
  )
}

export default AzureCloudProviderFields
