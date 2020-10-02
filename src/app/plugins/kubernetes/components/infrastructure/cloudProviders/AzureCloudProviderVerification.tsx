import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import PicklistField from 'core/components/validatedForm/PicklistField'
import CloudProviderRegionPicklist from 'k8s/components/common/CloudProviderRegionPicklist'
import ExternalLink from 'core/components/ExternalLink'
import { azurePrerequisitesLink } from 'k8s/links'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadCloudProviderDetails } from './actions'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import Text from 'core/elements/text'

const useStyles = makeStyles((theme: Theme) => ({
  field: {
    marginTop: theme.spacing(2),
    maxWidth: 'none',
  },
  spaceRight: {
    marginRight: theme.spacing(4),
  },
  checkIcon: {
    color: theme.palette.success.main,
    marginRight: theme.spacing(1),
  },
  timesIcon: {
    color: theme.palette.error.main,
    marginRight: theme.spacing(1),
  },
}))

interface Props {
  wizardContext: any
  setWizardContext: any
}

const RegionAvailability = ({ regions }) => {
  const classes = useStyles({})
  const available = regions?.length

  return (
    <>
      {available ? (
        <Text variant="body2" className={classes.spaceRight}>
          <FontAwesomeIcon className={classes.checkIcon} solid>
            check-circle
          </FontAwesomeIcon>
          Regions Available
        </Text>
      ) : (
        <Text variant="body2" className={classes.spaceRight}>
          <FontAwesomeIcon className={classes.timesIcon} solid>
            times-circle
          </FontAwesomeIcon>
          No Regions Available
        </Text>
      )}
    </>
  )
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
              <RegionAvailability regions={regions}></RegionAvailability>
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
