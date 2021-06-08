import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import PicklistField from 'core/components/validatedForm/PicklistField'
import ClusterDomainPicklist from '../clusters/ClusterDomainPicklist'
import AwsClusterSshKeyPicklist from '../clusters/aws/AwsClusterSshKeyPicklist'
import Info from 'core/components/validatedForm/Info'
import ExternalLink from 'core/components/ExternalLink'
import { awsPrerequisitesLink, awsRoute53HelpLink } from 'k8s/links'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadCloudProviderDetails, loadCloudProviderRegionDetails } from './actions'
import { pathStrOr } from 'utils/fp'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import Text from 'core/elements/text'
import { getIcon, getIconClass, RegionAvailability } from './helpers'
import { CloudProviders } from './model'
import CloudProviderRegionField from '../clusters/form-components/cloud-provider-region'
import SshKeyField from '../clusters/form-components/ssh-key-picklist'

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
  circleIcon: {
    color: theme.palette.grey['200'],
    marginRight: theme.spacing(1),
  },
  smallLink: {
    marginTop: '6px',
  },
}))

interface Props {
  wizardContext: any
  setWizardContext: any
}

const getRoute53String = (classes, loading, regionId, available) =>
  loading || !regionId
    ? 'Region needed for Route 53'
    : available
    ? 'Route 53 Domains Available'
    : 'Route 53 Domains Unavailable'

const getSshKeyString = (classes, loading, regionId, available) =>
  loading || !regionId
    ? 'Region needed for SSH keys'
    : available
    ? 'SSH Keys Detected'
    : 'No SSH Keys Detected'

const Route53Availability = ({ domains, loading, regionId }) => {
  const classes = useStyles({})
  const available = domains?.length
  return (
    <Text variant="body2" className={classes.spaceRight}>
      <FontAwesomeIcon className={getIconClass(classes, loading, regionId, available)} solid>
        {getIcon(classes, loading, regionId, available)}
      </FontAwesomeIcon>
      {getRoute53String(classes, loading, regionId, available)}
    </Text>
  )
}

const SshKeyAvailability = ({ keypairs, loading, regionId }) => {
  const classes = useStyles({})
  const available = keypairs?.length

  return (
    <Text variant="body2" className={classes.spaceRight}>
      <FontAwesomeIcon className={getIconClass(classes, loading, regionId, available)} solid>
        {getIcon(classes, loading, regionId, available)}
      </FontAwesomeIcon>
      {getSshKeyString(classes, loading, regionId, available)}
    </Text>
  )
}

const AwsCloudProviderVerification = ({ wizardContext, setWizardContext }: Props) => {
  const classes = useStyles({})

  const [regions, regionsLoading] = useDataLoader(loadCloudProviderDetails, {
    cloudProviderId: wizardContext.cloudProviderId,
  })

  const [details, loading] = useDataLoader(loadCloudProviderRegionDetails, {
    cloudProviderId: wizardContext.cloudProviderId,
    cloudProviderRegionId: wizardContext.region,
  })

  const domains = pathStrOr([], '0.domains', details)
  const keypairs = pathStrOr([], '0.keyPairs', details)

  return (
    <>
      <FormFieldCard
        title="AWS Region Availability"
        middleHeader={
          <>
            {wizardContext.cloudProviderId && !regionsLoading && (
              <RegionAvailability classes={classes} regions={regions} />
            )}
          </>
        }
        link={
          <ExternalLink url={awsPrerequisitesLink}>
            <Text variant="caption2">AWS Help</Text>
          </ExternalLink>
        }
      >
        <Text variant="body2">
          Platform9 deploys Kubernetes clusters into specified AWS Regions.
        </Text>
        <CloudProviderRegionField
          cloudProviderType={CloudProviders.Aws}
          onChange={(value) => setWizardContext({ region: value })}
          values={wizardContext}
        />
      </FormFieldCard>
      <FormFieldCard
        title="Route 53 Domain Name Registration"
        middleHeader={
          <Route53Availability
            loading={loading}
            regionId={wizardContext.region}
            domains={domains}
          />
        }
        link={
          <ExternalLink url={awsPrerequisitesLink}>
            <Text variant="caption2">AWS Help</Text>
          </ExternalLink>
        }
      >
        <Text variant="body2">
          Platform9 utilizes Route53 Domains to route traffic to clusters under management.
        </Text>
        <PicklistField
          DropdownComponent={ClusterDomainPicklist}
          id="awsDomain"
          label="Route 53 Domain"
          cloudProviderId={wizardContext.cloudProviderId}
          cloudProviderRegionId={wizardContext.region}
          disabled={!(wizardContext.cloudProviderId && wizardContext.region)}
        />
        {wizardContext.region && !loading && !domains.length && (
          <Info>
            <div>No registered Route53 Domains have been detected.</div>
            <div>Please register at least one domain with AWS Route53 to use Platform9.</div>
            <ExternalLink className={classes.smallLink} url={awsRoute53HelpLink}>
              <Text variant="caption2" className={classes.smallLink}>
                How to register a Route 53 domain
              </Text>
            </ExternalLink>
          </Info>
        )}
      </FormFieldCard>
      <FormFieldCard
        title="SSH Key"
        middleHeader={
          <SshKeyAvailability
            loading={loading}
            regionId={wizardContext.region}
            keypairs={keypairs}
          />
        }
        link={
          <ExternalLink url={awsPrerequisitesLink}>
            <Text variant="caption2">AWS Help</Text>
          </ExternalLink>
        }
      >
        <Text variant="body2">SSH Keys are required for access to manage EC2 Instances.</Text>
        <SshKeyField
          dropdownComponent={AwsClusterSshKeyPicklist}
          values={wizardContext}
          info=""
          wizardContext={wizardContext}
          setWizardContext={setWizardContext}
        />
      </FormFieldCard>
    </>
  )
}

export default AwsCloudProviderVerification
