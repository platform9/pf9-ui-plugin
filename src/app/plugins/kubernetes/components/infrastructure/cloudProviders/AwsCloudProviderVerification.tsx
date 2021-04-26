import React, { useEffect, useState } from 'react'
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
import Button from 'core/elements/button'
import { userPreferenceStoreActions } from 'k8s/components/common/preference-store/actions'
import { UserPreferenceKeys } from 'app/constants'
import { useSelector } from 'react-redux'
import { SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import { prop } from 'ramda'
import { RootState } from 'app/store'
import useDataUpdater from 'core/hooks/useDataUpdater'

const useStyles = makeStyles((theme: Theme) => ({
  info: {
    display: 'grid',
    gridTemplateColumns: 'min-content 1fr',
  },
  spaceRight: {
    marginRight: theme.spacing(4),
  },
  checkIcon: {
    color: theme.palette.green[500],
    marginRight: theme.spacing(1),
    alignSelf: 'center',
  },
  timesIcon: {
    color: theme.palette.red[500],
    marginRight: theme.spacing(1),
    alignSelf: 'center',
  },
  circleIcon: {
    color: theme.palette.grey['200'],
    marginRight: theme.spacing(1),
    alignSelf: 'center',
  },
  smallLink: {
    marginTop: '6px',
  },
  regionSelection: {
    display: 'grid',
    gridTemplateColumns: '60% 40%',
  },
  setDefaultButton: {
    alignSelf: 'center',
    justifySelf: 'flex-end',
  },
}))

interface Props {
  wizardContext: any
  setWizardContext: any
}

const getRoute53String = (classes, loading, regionId, available) =>
  loading || !regionId
    ? 'Select a region to validate Route53 Configuration'
    : available
    ? 'Route 53 Domains Available'
    : 'Route 53 Domains Unavailable'

const getSshKeyString = (classes, loading, regionId, available) =>
  loading || !regionId
    ? 'Select a Region to validate SSH Key availability'
    : available
    ? 'SSH Keys Detected'
    : 'No SSH Keys Detected'

const Route53Availability = ({ domains, loading, regionId, setWizardContext }) => {
  const classes = useStyles({})
  const available = domains?.length
  useEffect(() => {
    if (setWizardContext) {
      setWizardContext(!loading && regionId && !!available)
    }
  }, [loading, regionId, available])

  return (
    <div className={classes.info}>
      <FontAwesomeIcon className={getIconClass(classes, loading, regionId, available)} solid>
        {getIcon(classes, loading, regionId, available)}
      </FontAwesomeIcon>
      <Text variant="body2" className={classes.spaceRight}>
        {getRoute53String(classes, loading, regionId, available)}
      </Text>
    </div>
  )
}

const SshKeyAvailability = ({ keypairs, loading, regionId, setWizardContext }) => {
  const classes = useStyles({})
  const available = keypairs?.length
  useEffect(() => {
    if (setWizardContext) {
      setWizardContext(!loading && regionId && !!available)
    }
  }, [loading, regionId, available])

  return (
    <div className={classes.info}>
      <FontAwesomeIcon className={getIconClass(classes, loading, regionId, available)} solid>
        {getIcon(classes, loading, regionId, available)}
      </FontAwesomeIcon>
      <Text variant="body2" className={classes.spaceRight}>
        {getSshKeyString(classes, loading, regionId, available)}
      </Text>
    </div>
  )
}

const AwsCloudProviderVerification = ({ wizardContext, setWizardContext }: Props) => {
  const classes = useStyles({})
  const session = useSelector<RootState, SessionState>(prop(sessionStoreKey))
  const {
    userDetails: { id: userId },
  } = session
  const [hasRegionDefault, setHasRegionDefault] = useState(false)

  const [regions, regionsLoading] = useDataLoader(loadCloudProviderDetails, {
    cloudProviderId: wizardContext.cloudProviderId,
  })

  const [details, loading] = useDataLoader(loadCloudProviderRegionDetails, {
    cloudProviderId: wizardContext.cloudProviderId,
    cloudProviderRegionId: wizardContext.region,
  })

  const [[defaultRegion]] = useDataLoader(userPreferenceStoreActions.list, {
    userId,
    key: UserPreferenceKeys.AwsCloudProviderDefaultRegion,
  })
  const [setUserPreference] = useDataUpdater(userPreferenceStoreActions.create)

  useEffect(() => {
    if (defaultRegion) {
      setHasRegionDefault(true)
    }
  }, [defaultRegion])

  const domains = pathStrOr([], '0.domains', details)
  const keypairs = pathStrOr([], '0.keyPairs', details)

  const handleSetUserDefault = async (region) => {
    setHasRegionDefault(true)
    setUserPreference({
      userId,
      key: UserPreferenceKeys.AwsCloudProviderDefaultRegion,
      value: region,
    })
  }

  return (
    <>
      <FormFieldCard
        title="AWS Region Availability"
        middleHeader={
          <>
            {wizardContext.cloudProviderId && !regionsLoading && (
              <RegionAvailability
                classes={classes}
                regions={regions}
                setWizardContext={(isAvailable) =>
                  setWizardContext({ regionsAvailable: isAvailable })
                }
              />
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
        <div className={classes.regionSelection}>
          <CloudProviderRegionField
            cloudProviderType={CloudProviders.Aws}
            onChange={(value, label) =>
              setWizardContext({ region: value, regionOptionLabel: label })
            }
            values={wizardContext}
          />

          <Button
            color="primary"
            variant="light"
            className={classes.setDefaultButton}
            disabled={!wizardContext.region || hasRegionDefault}
            onClick={() => handleSetUserDefault(wizardContext.region)}
          >
            Set As Default
          </Button>
        </div>
      </FormFieldCard>
      <FormFieldCard
        title="AWS Native Clusters: Route53 Domains (Optional)"
        middleHeader={
          <Route53Availability
            loading={loading}
            regionId={wizardContext.region}
            domains={domains}
            setWizardContext={(isAvailable) =>
              setWizardContext({ route53DomainsAvailable: isAvailable })
            }
          />
        }
        link={
          <ExternalLink url={awsPrerequisitesLink}>
            <Text variant="caption2">AWS Help</Text>
          </ExternalLink>
        }
      >
        <Text variant="body2">
          Platform9 can utilize Route53 Domains to route traffic to AWS Native Clusters. Route53 is
          optional and not required for EKS.
        </Text>
        <PicklistField
          DropdownComponent={ClusterDomainPicklist}
          id="awsDomain"
          label="Route 53 Domain"
          cloudProviderId={wizardContext.cloudProviderId}
          cloudProviderRegionId={wizardContext.region}
          disabled={!(wizardContext.cloudProviderId && wizardContext.region)}
          onChange={(value, label) =>
            setWizardContext({ awsDomain: value, awsDomainOptionLabel: label })
          }
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
        title="AWS Native Clusters: SSH Keys"
        middleHeader={
          <SshKeyAvailability
            loading={loading}
            regionId={wizardContext.region}
            keypairs={keypairs}
            setWizardContext={(isAvailable) => setWizardContext({ sshKeysAvailable: isAvailable })}
          />
        }
        link={
          <ExternalLink url={awsPrerequisitesLink}>
            <Text variant="caption2">AWS Help</Text>
          </ExternalLink>
        }
      >
        <Text variant="body2">
          When building AWS Native Clusters, SSH Keys are required to access and configure EC2
          Instances. SSH Keys are not required to Manage EKS Clusters.
        </Text>
        <SshKeyField
          dropdownComponent={AwsClusterSshKeyPicklist}
          values={wizardContext}
          info=""
          onChange={(value) => setWizardContext({ sshKey: value })}
        />
      </FormFieldCard>
    </>
  )
}

export default AwsCloudProviderVerification
