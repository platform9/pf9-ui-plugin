import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import ExternalLink from 'core/components/ExternalLink'
import { azurePrerequisitesLink } from 'k8s/links'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadCloudProviderDetails } from './actions'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import Text from 'core/elements/text'
import { RegionAvailability } from './helpers'
import { CloudProviders } from './model'
import Button from 'core/elements/button'
import { UserPreferences } from 'app/constants'
import SshKeyTextfield from '../clusters/form-components/ssh-key-textfield'
import CloudProviderRegionField from '../clusters/form-components/cloud-provider-region'

const useStyles = makeStyles((theme: Theme) => ({
  spaceRight: {
    marginRight: theme.spacing(4),
  },
  checkIcon: {
    color: theme.palette.green[500],
    marginRight: theme.spacing(1),
  },
  timesIcon: {
    color: theme.palette.red[500],
    marginRight: theme.spacing(1),
  },
  selectionArea: {
    display: 'grid',
    gridTemplateColumns: '50% 50%',
  },
  setDefaultButton: {
    alignSelf: 'center',
    justifySelf: 'flex-end',
  },
  sshKey: {
    backgroundColor: 'white',
    padding: '0 5px',
    margin: '0 -5px',
  },
}))

interface Props {
  wizardContext: any
  setWizardContext: any
}

const AzureCloudProviderVerification = ({ wizardContext, setWizardContext }: Props) => {
  const classes = useStyles({})

  const [regions, regionsLoading] = useDataLoader(loadCloudProviderDetails, {
    cloudProviderId: wizardContext.cloudProviderId,
  })

  const handleSetUserDefault = async (key, value) => {
    console.log(key)
    setWizardContext({ [key]: value })
  }

  return (
    <>
      <FormFieldCard
        title="Available Regions"
        middleHeader={
          <>
            {wizardContext.cloudProviderId && !regionsLoading && (
              <RegionAvailability
                classes={classes}
                regions={regions}
                setWizardContext={(isAvailable) =>
                  setWizardContext({ regionsAvailable: isAvailable })
                }
              ></RegionAvailability>
            )}
          </>
        }
        link={
          <ExternalLink url={azurePrerequisitesLink}>
            <Text variant="caption2">Azure Help</Text>
          </ExternalLink>
        }
      >
        <Text variant="body2">
          Platform9 deploys Kubernetes clusters into specified Azure Regions.
        </Text>
        <div className={classes.selectionArea}>
          <CloudProviderRegionField
            cloudProviderType={CloudProviders.Azure}
            onChange={(value, label) =>
              setWizardContext({ region: value, regionOptionLabel: label })
            }
            values={wizardContext}
          />
          <Button
            color="primary"
            variant="light"
            className={classes.setDefaultButton}
            disabled={!wizardContext.region}
            onClick={() =>
              handleSetUserDefault(UserPreferences.AzureRegion, wizardContext.regionOptionLabel)
            }
          >
            Set As Default
          </Button>
        </div>
      </FormFieldCard>
      <FormFieldCard title="Public SSH Key">
        <Text variant="body2">
          Add a Public SSH Key to be used as the default key during cluster creation.
        </Text>
        <div className={classes.selectionArea}>
          <SshKeyTextfield
            wizardContext={wizardContext}
            setWizardContext={setWizardContext}
            required={false}
          />
          <Button
            color="primary"
            variant="light"
            className={classes.setDefaultButton}
            disabled={!wizardContext.sshKey}
            onClick={() => handleSetUserDefault(UserPreferences.AzureSshKey, wizardContext.sshKey)}
          >
            Set As Default
          </Button>
        </div>
      </FormFieldCard>
    </>
  )
}

export default AzureCloudProviderVerification
