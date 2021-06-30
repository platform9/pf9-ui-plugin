import React, { FC, useCallback, useMemo } from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import ClusterNameField from '../../form-components/name'
import { CloudDefaults, CloudProviders } from 'k8s/components/infrastructure/cloudProviders/model'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { azurePrerequisitesLink } from 'k8s/links'
import Text from 'core/elements/text'
import ExternalLink from 'core/components/ExternalLink'
import WizardStep from 'core/components/wizard/WizardStep'
import { makeStyles } from '@material-ui/core/styles'
import Theme from 'core/themes/model'
import FormReviewTable from 'core/components/validatedForm/review-table'
import { capitalizeString, castBoolToStr } from 'utils/misc'
import { defaultEtcBackupPath, UserPreferences } from 'app/constants'
import CloudProviderField from '../../form-components/cloud-provider'
import CloudProviderRegionField from '../../form-components/cloud-provider-region'
import SshKeyTextField from '../../form-components/ssh-key-textfield'
import KubernetesVersion from '../../form-components/kubernetes-version'
import { azureClusterTracking } from '../../tracking'
import { ClusterCreateTypes } from '../../model'
import useScopedPreferences from 'core/session/useScopedPreferences'
import { isEmpty } from 'ramda'

export const initialContext = {
  containersCidr: '10.20.0.0/22',
  servicesCidr: '10.21.0.0/22',
  numMasters: 1,
  numWorkers: 0,
  allowWorkloadsOnMaster: true,
  enableCAS: false,
  runtimeConfigOption: 'default',
  useAllAvailabilityZones: true,
  assignPublicIps: true,
  masterSku: 'Standard_B4MS',
  workerSku: 'Standard_B4MS',
  ami: 'ubuntu',
  networkPlugin: 'flannel',
  etcdBackup: true,
  etcdStoragePath: defaultEtcBackupPath,
  etcdBackupInterval: 60 * 24,
  prometheusMonitoringEnabled: true,
  tags: [],
  appCatalogEnabled: false,
  networkStack: 'ipv4',
  privileged: true,
}

const columns = [
  { id: 'numMasters', label: 'Master nodes' },
  { id: 'numWorkers', label: 'Worker nodes' },
  {
    id: 'allowWorkloadsOnMaster',
    label: 'Enable workloads on all master nodes',
    render: (value) => castBoolToStr()(value),
  },
  { id: 'masterSku', label: 'Master Node SKU' },
  { id: 'workerSku', label: 'Worker Node SKU' },
  { id: 'ami', label: 'Operating System', insertDivider: true },
  {
    id: 'networkPlugin',
    label: 'CNI',
    render: (value) => capitalizeString(value),
  },
  {
    id: 'etcdBackup',
    label: 'ETCD Backup',
    render: (value) => castBoolToStr()(value),
    insertDivider: true,
  },
  { id: 'etcdStoragePath', label: 'Storage Path' },
  { id: 'etcdBackupInterval', label: 'Backup Interval (minutes)' },
  {
    id: 'prometheusMonitoringEnabled',
    label: 'Enable monitoring with prometheus',
    render: (value) => castBoolToStr()(value),
  },
]

const trackingFields = {
  platform: CloudProviders.Azure,
  target: ClusterCreateTypes.OneClick,
}

const useStyles = makeStyles<Theme>((theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
}))

interface Props {
  wizardContext: any
  setWizardContext: any
  onNext: any
}

const OneClickAzureCluster: FC<Props> = ({ wizardContext, setWizardContext, onNext }) => {
  const classes = useStyles()
  const [prefs] = useScopedPreferences('defaults')
  const cloudDefaults = useMemo(() => prefs[UserPreferences.Azure] || {}, [prefs])

  const handleRegionChange = (regionName) =>
    setWizardContext({ region: regionName, location: regionName })

  const handleCloudProviderChange = (value) => {
    setWizardContext({
      cloudProviderId: value,
    })

    // Populate the form with default values from the pref store AFTER the user chooses the
    // cloud provider. This is to maintain form order. Cloud provider ID is needed to populate the options
    // for the rest of the fields
    setCloudDefaults()
  }

  const setCloudDefaults = useCallback(() => {
    if (isEmpty(cloudDefaults)) return
    setWizardContext({ ...cloudDefaults, location: cloudDefaults[CloudDefaults.Region] })
  }, [cloudDefaults])

  return (
    <WizardStep stepId="one-click" onNext={azureClusterTracking.oneClick(trackingFields)}>
      <ValidatedForm
        classes={{ root: classes.validatedFormContainer }}
        fullWidth
        initialValues={wizardContext}
        onSubmit={setWizardContext}
        triggerSubmit={onNext}
        elevated={false}
      >
        {({ values }) => (
          <>
            <FormFieldCard
              title="Cluster Configuration"
              link={
                <ExternalLink url={azurePrerequisitesLink}>
                  <Text variant="caption2">Azure Cluster Help</Text>
                </ExternalLink>
              }
            >
              {/* Cluster Name */}
              <ClusterNameField setWizardContext={setWizardContext} />

              {/* Cloud Provider */}
              <CloudProviderField
                cloudProviderType={CloudProviders.Azure}
                wizardContext={wizardContext}
                setWizardContext={setWizardContext}
                onChange={handleCloudProviderChange}
              />

              {/* Cloud Provider Region */}
              <CloudProviderRegionField
                cloudProviderType={CloudProviders.Azure}
                wizardContext={wizardContext}
                values={values}
                onChange={handleRegionChange}
                disabled={!values.cloudProviderId && !values.region}
              />

              {/* SSH Key */}
              <SshKeyTextField wizardContext={wizardContext} setWizardContext={setWizardContext} />

              <KubernetesVersion
                wizardContext={wizardContext}
                setWizardContext={setWizardContext}
              />
            </FormFieldCard>

            <FormFieldCard title="Default Settings for New Cluster">
              <FormReviewTable data={wizardContext} columns={columns} />
            </FormFieldCard>
          </>
        )}
      </ValidatedForm>
    </WizardStep>
  )
}

export default OneClickAzureCluster
