import React from 'react'
import { allPass } from 'ramda'
import { makeStyles } from '@material-ui/styles'

import { pmkCliOverviewLink } from 'k8s/links'
import { defaultEtcBackupPath } from 'app/constants'
import { capitalizeString, castBoolToStr } from 'utils/misc'

import ExternalLink from 'core/components/ExternalLink'
import { masterNodeLengthValidator } from 'core/utils/fieldValidators'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import FormReviewTable from 'core/components/validatedForm/review-table'
import WizardStep from 'core/components/wizard/WizardStep'

import ClusterNameField from '../../form-components/name'
import ClusterHostChooser, { isConnected, isUnassignedNode } from '../ClusterHostChooser'
import KubernetesVersion from '../../form-components/kubernetes-version'

import Theme from 'core/themes/model'
import { ClusterCreateTypeNames, ClusterCreateTypes } from '../../model'
import { CalicoDetectionTypes } from '../../form-components/calico-network-fields'

export const initialContext = {
  containersCidr: '10.20.0.0/22',
  servicesCidr: '10.21.0.0/22',
  networkPlugin: 'calico',
  calicoIpIpMode: 'Always',
  calicoNatOutgoing: true,
  calicoBlockSize: '24',
  runtimeConfigOption: 'default',
  mtuSize: 1440,
  privileged: true,
  etcdBackup: true,
  etcdStoragePath: defaultEtcBackupPath,
  etcdBackupInterval: 1440,
  prometheusMonitoringEnabled: true,
  allowWorkloadsOnMaster: true,
  tags: [],
  appCatalogEnabled: false,
  networkStack: 'ipv4',
  calicoIPv4: 'autodetect',
  calicoIPv6: 'none',
  calicoDetectionMethod: CalicoDetectionTypes.FirstFound,
}

const columns = [
  { id: 'containersCidr', label: 'Containers CIDR' },
  { id: 'servicesCidr', label: 'Services CIDR' },
  {
    id: 'networkPlugin',
    label: 'CNI',
    render: (value) => capitalizeString(value),
    insertDivider: true,
  },
  { id: 'calicoIpIpMode', label: 'IP in IP Encapsulation Mode' },
  { id: 'calicoNatOutgoing', label: 'NAT Outgoing', render: (value) => castBoolToStr()(value) },
  { id: 'calicoBlockSize', label: 'Block Size' },
  { id: 'mtuSize', label: 'Block Size' },
  {
    id: 'privileged',
    label: 'Privileged',
    render: (value) => castBoolToStr()(value),
    insertDivider: true,
  },
  {
    id: 'allowWorkloadsOnMaster',
    label: 'Enable workloads on master node',
    render: (value) => castBoolToStr()(value),
  },
  {
    id: 'etcdBackup',
    label: 'ETCD Backup',
    render: (value) => castBoolToStr()(value),
    insertDivider: true,
  },
  { id: 'etcdStoragePath', label: 'Storage Path' },
  { id: 'etcdBackupInterval', label: 'Backup Interval (minutes)' },
]

const OneClickPhysicalMachineCluster = ({ wizardContext, setWizardContext, onNext }) => {
  const classes = useStyles({})
  return (
    <WizardStep stepId="physical-one-click" onNext={onNext}>
      <ValidatedForm
        classes={{ root: classes.validatedFormContainer }}
        fullWidth
        initialValues={wizardContext}
        onSubmit={setWizardContext}
        triggerSubmit={onNext}
        elevated={false}
      >
        {/* <PollingData loading={loading} onReload={reload} hidden /> */}
        {/* Cluster Name */}
        <FormFieldCard
          title={`${ClusterCreateTypeNames[ClusterCreateTypes.OneClick]} Single Node Cluster Setup`}
          link={
            <ExternalLink textVariant="caption2" url={pmkCliOverviewLink}>
              BareOS Cluster Help
            </ExternalLink>
          }
        >
          <ClusterNameField setWizardContext={setWizardContext} />
          <KubernetesVersion />
        </FormFieldCard>

        <FormFieldCard
          title="Select a node"
          link={
            <ExternalLink textVariant="caption2" url={pmkCliOverviewLink}>
              Not Seeing Any Nodes?
            </ExternalLink>
          }
        >
          <ClusterHostChooser
            id="masterNodes"
            selection="single"
            filterFn={allPass([isConnected, isUnassignedNode])}
            onChange={(value) => setWizardContext({ masterNodes: value })}
            validations={[masterNodeLengthValidator]}
            required
          />
        </FormFieldCard>

        <FormFieldCard title="Default Settings for New Cluster">
          <FormReviewTable data={wizardContext} columns={columns} />
        </FormFieldCard>
      </ValidatedForm>
    </WizardStep>
  )
}

export default OneClickPhysicalMachineCluster

const useStyles = makeStyles<Theme>((theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
}))
