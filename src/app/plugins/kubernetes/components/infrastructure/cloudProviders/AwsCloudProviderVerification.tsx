import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import PicklistField from 'core/components/validatedForm/PicklistField'
import CloudProviderRegionPicklist from 'k8s/components/common/CloudProviderRegionPicklist'
import ClusterDomainPicklist from '../clusters/ClusterDomainPicklist'
import AwsClusterSshKeyPicklist from '../clusters/AwsClusterSshKeyPicklist'
import Info from 'core/components/validatedForm/Info'
import ExternalLink from 'core/components/ExternalLink'
import { awsPrerequisitesLink, awsRoute53HelpLink } from 'k8s/links'
import useDataLoader from 'core/hooks/useDataLoader'
import { loadCloudProviderDetails, loadCloudProviderRegionDetails } from './actions'
import { pathStrOr } from 'utils/fp'
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

const Route53Availability = ({ domains, loading, regionId }) => {
  const classes = useStyles({})
  const available = domains?.length
  return (
    <>
      {!regionId || loading ? (
        <Text variant="body2" className={classes.spaceRight}>
          <FontAwesomeIcon className={classes.circleIcon} solid>
            circle
          </FontAwesomeIcon>
          Region needed for Route 53
        </Text>
      ) : available ? (
        <Text variant="body2" className={classes.spaceRight}>
          <FontAwesomeIcon className={classes.checkIcon} solid>
            check-circle
          </FontAwesomeIcon>
          Route 53 Domains Available
        </Text>
      ) : (
        <Text variant="body2" className={classes.spaceRight}>
          <FontAwesomeIcon className={classes.timesIcon} solid>
            times-circle
          </FontAwesomeIcon>
          Route 53 Domains Unavailable
        </Text>
      )}
    </>
  )
}

const SshKeyAvailability = ({ keypairs, loading, regionId }) => {
  const classes = useStyles({})
  const available = keypairs?.length

  return (
    <>
      {!regionId || loading ? (
        <Text variant="body2" className={classes.spaceRight}>
          <FontAwesomeIcon className={classes.circleIcon} solid>
            circle
          </FontAwesomeIcon>
          Region needed for SSH keys
        </Text>
      ) : available ? (
        <Text variant="body2" className={classes.spaceRight}>
          <FontAwesomeIcon className={classes.checkIcon} solid>
            check-circle
          </FontAwesomeIcon>
          SSH Keys Detected
        </Text>
      ) : (
        <Text variant="body2" className={classes.spaceRight}>
          <FontAwesomeIcon className={classes.timesIcon} solid>
            times-circle
          </FontAwesomeIcon>
          No SSH Keys Detected
        </Text>
      )}
    </>
  )
}

const AwsCloudProviderVerification = ({ wizardContext, setWizardContext }: Props) => {
  const classes = useStyles({})

  const [regions, regionsLoading] = useDataLoader(loadCloudProviderDetails, {
    cloudProviderId: wizardContext.cloudProviderId,
  })

  const [details, loading] = useDataLoader(loadCloudProviderRegionDetails, {
    cloudProviderId: wizardContext.cloudProviderId,
    cloudProviderRegionId: wizardContext.cloudProviderRegionId,
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
              <RegionAvailability regions={regions}></RegionAvailability>
            )}
          </>
        }
        link={
          <ExternalLink url={awsPrerequisitesLink}>
            <Text variant="caption2">AWS Help</Text>
          </ExternalLink>
        }
        className={classes.field}
      >
        <Text variant="body2">
          Platform9 deploys Kubernetes clusters into specified AWS Regions.
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
      <FormFieldCard
        title="Route 53 Domain Name Registration"
        middleHeader={
          <Route53Availability
            loading={loading}
            regionId={wizardContext.cloudProviderRegionId}
            domains={domains}
          />
        }
        link={
          <ExternalLink url={awsPrerequisitesLink}>
            <Text variant="caption2">AWS Help</Text>
          </ExternalLink>
        }
        className={classes.field}
      >
        <Text variant="body2">
          Platform9 utilizes Route53 Domains to route traffic to clusters under management.
        </Text>
        <PicklistField
          DropdownComponent={ClusterDomainPicklist}
          id="awsDomain"
          label="Route 53 Domain"
          cloudProviderId={wizardContext.cloudProviderId}
          cloudProviderRegionId={wizardContext.cloudProviderRegionId}
          disabled={!(wizardContext.cloudProviderId && wizardContext.cloudProviderRegionId)}
        />
        {wizardContext.cloudProviderRegionId && !loading && !domains.length && (
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
            regionId={wizardContext.cloudProviderRegionId}
            keypairs={keypairs}
          />
        }
        link={
          <ExternalLink url={awsPrerequisitesLink}>
            <Text variant="caption2">AWS Help</Text>
          </ExternalLink>
        }
        className={classes.field}
      >
        <Text variant="body2">SSH Keys are required for access to manage EC2 Instances.</Text>
        <PicklistField
          DropdownComponent={AwsClusterSshKeyPicklist}
          disabled={!(wizardContext.cloudProviderId && wizardContext.cloudProviderRegionId)}
          id="sshKey"
          label="SSH Key"
          cloudProviderId={wizardContext.cloudProviderId}
          cloudProviderRegionId={wizardContext.cloudProviderRegionId}
        />
      </FormFieldCard>
    </>
  )
}

export default AwsCloudProviderVerification
