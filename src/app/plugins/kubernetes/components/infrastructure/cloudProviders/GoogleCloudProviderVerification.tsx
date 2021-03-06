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
}))

interface Props {
  wizardContext: any
  setWizardContext: any
}

const GoogleCloudProviderVerification = ({ wizardContext, setWizardContext }: Props) => {
  const classes = useStyles({})

  const [regions, regionsLoading] = useDataLoader(loadCloudProviderDetails, {
    cloudProviderId: wizardContext.cloudProviderId,
  })

  // Regions expected to return empty, not sure if it may change in the future
  if (!regions.length) {
    return null
  }

  return (
    <>
      <FormFieldCard
        title="Google Region Availability"
        middleHeader={
          <>
            {wizardContext.cloudProviderId && !regionsLoading && (
              <RegionAvailability classes={classes} regions={regions} />
            )}
          </>
        }
        link={
          <ExternalLink url={azurePrerequisitesLink}>
            <Text variant="caption2">Google Help</Text>
          </ExternalLink>
        }
      >
        <Text variant="body2">
          Platform9 deploys Kubernetes clusters into specified Google Regions.
        </Text>
        <CloudProviderRegionField
          cloudProviderType={CloudProviders.Gcp}
          onChange={(value) => setWizardContext({ region: value })}
          values={wizardContext}
          wizardContext={wizardContext}
        />
      </FormFieldCard>
    </>
  )
}

export default GoogleCloudProviderVerification
