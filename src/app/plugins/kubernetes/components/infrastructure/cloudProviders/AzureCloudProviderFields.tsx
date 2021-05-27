import React from 'react'
import TextField from 'core/components/validatedForm/TextField'
import Button from 'core/elements/button'
import Theme from 'core/themes/model'
import { makeStyles } from '@material-ui/styles'
import { ErrorMessage } from 'core/components/validatedForm/ErrorMessage'
import InfoTooltipWrapper from 'core/components/InfoTooltipWrapper'
import Info from 'core/components/validatedForm/Info'

const useStyles = makeStyles((theme: Theme) => ({
  inCardSubmit: {
    marginTop: theme.spacing(2.5),
    width: 'max-content',
  },
  bullets: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: theme.spacing(1),
  },
  bullet: {
    width: '50%',
  },
  // Weird but works to make sure that the bullets aren't overlapping with text
  bulletText: {
    paddingRight: theme.spacing(3),
    display: 'list-item',
  },
  info: {
    marginBottom: theme.spacing(4),
  },
}))

const updateButtonTooltipMsg =
  'An Azure Cloud Provider cannot be changed. To update the Service Principle, recreate the cloud provider.'

interface Props {
  wizardContext: any
  setWizardContext: any
  showSubmitInCard: boolean
  updateWizard: boolean
  errorMessage: string
  showInfo?: boolean
  setDefaultValueForTextfields?: boolean
  defaultTextfieldValue?: string
}

const AzureCloudProviderFields = ({
  wizardContext,
  setWizardContext,
  showSubmitInCard = false,
  updateWizard = false,
  errorMessage = '',
  showInfo = true,
  setDefaultValueForTextfields = false,
  defaultTextfieldValue = '**********************',
}: Props) => {
  const { info, bullets, bullet, bulletText, inCardSubmit } = useStyles({})

  return (
    <>
      {showInfo && (
        <Info expanded={false} className={info}>
          <div>
            Provide the Tenant, Subscription ID, Client ID, and Client Secret for an Azure Service
            Principle Account that has been assigned the Azure Contributor Role.
          </div>
          <br></br>
          <div>
            The Contributor role is required as Platform9 will create new resources in Azure
            including:
          </div>
          <ul className={bullets}>
            <li className={bullet}>
              <span className={bulletText}>Virtual Machines</span>
            </li>
            <li className={bullet}>
              <span className={bulletText}>Scale Sets</span>
            </li>
            <li className={bullet}>
              <span className={bulletText}>Security Groups</span>
            </li>
            <li className={bullet}>
              <span className={bulletText}>Load Balancer</span>
            </li>
            <li className={bullet}>
              <span className={bulletText}>Resource Groups</span>
            </li>
            <li className={bullet}>
              <span className={bulletText}>Virtual Networks</span>
            </li>
          </ul>
        </Info>
      )}
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
        value={
          !wizardContext.tenantId && setDefaultValueForTextfields
            ? defaultTextfieldValue
            : wizardContext.tenantId
        }
        info="The tenant ID of the service principal"
        disabled={updateWizard}
        required
      />
      <TextField
        id="clientId"
        label="Client ID"
        onChange={(value) => setWizardContext({ clientId: value })}
        value={
          !wizardContext.clientId && setDefaultValueForTextfields
            ? defaultTextfieldValue
            : wizardContext.clientId
        }
        info="The client ID of the service principal"
        disabled={updateWizard}
        required
      />
      <TextField
        id="clientSecret"
        type="password"
        label="Client Secret"
        onChange={(value) => setWizardContext({ clientSecret: value })}
        value={
          !wizardContext.clientSecret && setDefaultValueForTextfields
            ? defaultTextfieldValue
            : wizardContext.clientSecret
        }
        info="The client secret of the service principal"
        disabled={updateWizard}
        required
      />
      <TextField
        id="subscriptionId"
        label="Subscription ID"
        onChange={(value) => setWizardContext({ subscriptionId: value })}
        value={
          !wizardContext.subscriptionId && setDefaultValueForTextfields
            ? defaultTextfieldValue
            : wizardContext.subscriptionId
        }
        info="The ID of the subscription that correlates to the service principal"
        disabled={updateWizard}
        required
      />
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {showSubmitInCard && (
        <InfoTooltipWrapper info={updateButtonTooltipMsg} className={inCardSubmit}>
          {/* <div className={inCardSubmit}> */}
          <Button disabled type="submit">
            Update Cloud Provider
          </Button>
          {/* </div> */}
        </InfoTooltipWrapper>
      )}
    </>
  )
}

export default AzureCloudProviderFields
