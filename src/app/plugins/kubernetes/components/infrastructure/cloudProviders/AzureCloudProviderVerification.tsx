import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import PicklistField from 'core/components/validatedForm/PicklistField'
import CloudProviderRegionPicklist from 'k8s/components/common/CloudProviderRegionPicklist'
import ExternalLink from 'core/components/ExternalLink'
import { azurePrerequisitesLink } from 'k8s/links'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadCloudProviderDetails } from './actions'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import Text from 'core/elements/text'
import { RegionAvailability } from './helpers'

const useStyles = makeStyles((theme: Theme) => ({
  field: {
    marginTop: theme.spacing(2),
    maxWidth: 'none',
  },
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

const AzureCloudProviderVerification = ({ wizardContext, setWizardContext }: Props) => {
  const classes = useStyles({})

  const [regions, regionsLoading] = useDataLoader(loadCloudProviderDetails, {
    cloudProviderId: wizardContext.cloudProviderId,
  })

  return (
    <>
      <FormFieldCard
        title="Azure Region Availability"
        middleHeader={
          <>
            {wizardContext.cloudProviderId && !regionsLoading && (
              <RegionAvailability classes={classes} regions={regions}></RegionAvailability>
            )}
          </>
        }
        link={
          <ExternalLink url={azurePrerequisitesLink}>
            <Text variant="caption2">Azure Help</Text>
          </ExternalLink>
        }
        className={classes.field}
      >
        <Text variant="body2">
          Platform9 deploys Kubernetes clusters into specified Azure Regions.
        </Text>
        <PicklistField
          DropdownComponent={CloudProviderRegionPicklist}
          id="region"
          label="Region"
          cloudProviderId={wizardContext.cloudProviderId}
          onChange={(region) => setWizardContext({ cloudProviderRegionId: region })}
          value={wizardContext.cloudProviderRegionId}
        />
      </FormFieldCard>
    </>
  )
}

export default AzureCloudProviderVerification
