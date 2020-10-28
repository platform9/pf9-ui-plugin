// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */

import React, { FC, useEffect, useRef, useState } from 'react'
import FormWrapper from 'core/components/FormWrapper'
import BareOsClusterReviewTable from './BareOsClusterReviewTable'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import KeyValuesField from 'core/components/validatedForm/KeyValuesField'
import PicklistField from 'core/components/validatedForm/PicklistField'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import VipInterfaceChooser from './VipInterfaceChooser'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import useDataUpdater from 'core/hooks/useDataUpdater'
import useReactRouter from 'use-react-router'
import DownloadCliWalkthrough from '../../nodes/DownloadCliWalkthrough'
import CodeBlock from 'core/components/CodeBlock'
import ExternalLink from 'core/components/ExternalLink'
import ClusterHostChooser, {
  excludeNodes,
  isConnected,
  isUnassignedNode,
} from './ClusterHostChooser'
import { clusterActions } from '../actions'
import { pathJoin } from 'utils/misc'
import { defaultEtcBackupPath, k8sPrefix } from 'app/constants'
import { makeStyles } from '@material-ui/styles'
import {
  masterNodeLengthValidator,
  requiredValidator,
  customValidator,
} from 'core/utils/fieldValidators'
import { allPass } from 'ramda'
import EtcdBackupFields from '../EtcdBackupFields'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { routes } from 'core/utils/routes'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import Alert from 'core/components/Alert'
import {
  pmkCliOverviewLink,
  runtimePrivilegedLink,
  pmkCliPrepNodeLink,
  pf9PmkArchitectureDigLink,
} from 'k8s/links'
import { trackEvent } from 'utils/tracking'
// import { loadNodes } from '../../nodes/actions'
// import useDataLoader from 'core/hooks/useDataLoader'
// import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core'
// import Text from 'core/elements/text'
import { hexToRGBA } from 'core/utils/colorHelpers'
// import PollingData from 'core/components/PollingData'
import Theme from 'core/themes/model'
import WizardMeta from 'core/components/wizard/WizardMeta'
import { ClusterCreateTypes } from '../model'
import CloudProviderCard from 'k8s/components/common/CloudProviderCard'
import { CloudProviders } from '../../cloudProviders/model'
import DocumentMeta from 'core/components/DocumentMeta'
import { getFormTitle } from '../helpers'

const listUrl = pathJoin(k8sPrefix, 'infrastructure')

// const initialContext = {
//   containersCidr: '10.20.0.0/16',
//   servicesCidr: '10.21.0.0/16',
//   networkPlugin: 'flannel',
//   runtimeConfigOption: 'default',
//   mtuSize: 1440,
//   etcdStoragePath: defaultEtcBackupPath,
//   etcdBackupInterval: 60 * 24,
//   prometheusMonitoringEnabled: true,
//   tags: [],
//   appCatalogEnabled: false,
// }
// IP and Block Size validator
// /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(0?[1-9]|[12][0-9]|3[01])$/

const calicoBlockSizeValidator = customValidator((value, formValues) => {
  const blockSize = `${formValues.containersCidr}`.split('/')[1]
  return value > 20 && value < 32 && value > blockSize
}, 'Calico Block Size must be greater than 20, less than 32 and not conflict with the Container CIDR')

const cidrBlockSizeValidator = customValidator((value) => {
  const blockSize = parseInt(`${value}`.split('/')[1])
  return blockSize > 0 && blockSize < 32
}, 'Block Size must be greater than 0 and less than 32')

const isValidIpAddress = (ip) => {
  // validates the octect ranges for an IP
  if (ip === '0.0.0.0' || ip === '255.255.255.255') {
    return false
  }
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
    ip,
  )
}

const IPValidator = customValidator((value, formValues) => {
  const IP = `${value}`.split('/')[0]
  return isValidIpAddress(IP)
}, 'IP invalid, must be between 0.0.0.0 and 255.255.255.255')

const IPValidatorRange = customValidator((value, formValues) => {
  const pairs = value.split(',')
  if (!pairs.length) return false

  for (const pair of pairs) {
    const [startIp, endIp] = pair.split('-')
    if (!isValidIpAddress(startIp) || !isValidIpAddress(endIp)) {
      return false
    }
  }
  return true
}, 'Invalid format, must be valid IP addresses of the form: startIP1-endIP1,startIP2-endIP2')

const containerAndServicesIPEqualsValidator = customValidator((value, formValues) => {
  const containersIP = `${formValues.containersCidr}`.split('/')[0]
  const servicesIP = `${value}`.split('/')[0]
  return containersIP !== servicesIP
}, 'The services CIDR cannot have the same IP address as the containers CIDR')

const runtimeConfigOptions = [
  { label: 'Default API groups and versions', value: 'default' },
  { label: 'All API groups and versions', value: 'all' },
  { label: 'Custom', value: 'custom' },
]

const networkPluginOptions = [
  { label: 'Flannel', value: 'flannel' },
  { label: 'Calico', value: 'calico' },
  // { label: 'Canal (experimental)', value: 'canal' },
]

const calicoIpIpOptions = [
  { label: 'Always', value: 'Always' },
  { label: 'Cross Subnet', value: 'CrossSubnet' },
  { label: 'Never', value: 'Never' },
]
const calicoIpIPHelpText = {
  Always: 'Encapsulates POD traffic in IP-in-IP between nodes.',
  CrossSubnet:
    'Encapsulation when nodes span subnets and cross routers that may drop native POD traffic, this is not required between nodes with L2 connectivity.',
  Never: 'Disables IP in IP Encapsulation.',
}

const handleNetworkPluginChange = (option, wizardContext) => {
  const payload = {
    networkPlugin: option,
    privileged: option === 'calico' ? true : wizardContext.privileged,
    calicoIpIpMode: option === 'calico' ? 'Always' : undefined,
    calicoNatOutgoing: option === 'calico' ? true : undefined,
    calicoV4BlockSize: option === 'calico' ? '24' : undefined,
  }
  return payload
}

const useStyles = makeStyles<Theme>((theme) => ({
  inline: {
    display: 'grid',
  },
  innerWrapper: {
    marginBottom: theme.spacing(2),
  },
  blueIcon: {
    color: theme.palette.primary.main,
  },
  paddBottom: {
    paddingBottom: theme.spacing(4),
  },
  alert: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    backgroundColor: hexToRGBA(theme.palette.primary.main, 0.1),
    display: 'grid',
    gridGap: theme.spacing(),
    gridTemplateColumns: 'min-content 1fr',
  },
}))

// Segment tracking for wizard steps
const basicOnNext = (context) => {
  trackEvent('WZ New BareOS Cluster 1 Nodes Connected', {
    wizard_step: 'Initial Setup',
    wizard_state: 'In-Progress',
    wizard_progress: '1 of 6',
    wizard_name: 'Add New BareOS Cluster',
    cluster_name: context.name,
  })
}
const mastersOnNext = (context) => {
  trackEvent('WZ New BareOS Cluster 2 Master Nodes', {
    wizard_step: 'Select Master Nodes',
    wizard_state: 'In-Progress',
    wizard_progress: '2 of 6',
    wizard_name: 'Add New BareOS Cluster',
    master_nodes: (context.masterNodes && context.masterNodes.length) || 0,
    allow_workloads_on_master: context.allowWorkloadsOnMaster,
    privileged: context.privileged,
  })
}

const workersOnNext = (context) => {
  trackEvent('WZ New BareOS Cluster 3 Worker Nodes', {
    wizard_step: 'Select Worker Nodes',
    wizard_state: 'In-Progress',
    wizard_progress: '3 of 6',
    wizard_name: 'Add New BareOS Cluster',
    worker_nodes: (context.workerNodes && context.workerNodes.length) || 0,
  })
}

const networkOnNext = (context) => {
  trackEvent('WZ New BareOS Cluster 4 Networking Details', {
    wizard_step: 'Configure Network',
    wizard_state: 'In-Progress',
    wizard_progress: '4 of 6',
    wizard_name: 'Add New BareOS Cluster',
    network_backend: context.networkPlugin,
  })
}

const advancedOnNext = (context) => {
  trackEvent('WZ New BareOS Cluster 5 Advanced Configuration', {
    wizard_step: 'Advanced Configuration',
    wizard_state: 'In-Progress',
    wizard_progress: '5 of 6',
    wizard_name: 'Add New BareOS Cluster',
    enable_etcd_backup: !!context.enableEtcdBackup,
    enable_monitoring: !!context.prometheusMonitoringEnabled,
  })
}

const reviewOnNext = (context) => {
  trackEvent('WZ New BareOS Cluster 6 Review', {
    wizard_step: 'Review',
    wizard_state: 'Finished',
    wizard_progress: '6 of 6',
    wizard_name: 'Add New BareOS Cluster',
  })
}

const canFinishAndReview = ({
  masterNodes,
  workerNodes,
  allowWorkloadsOnMaster,
  masterVipIpv4,
  masterVipIface,
}) => {
  const hasMasters = !!masterNodes && masterNodes.length > 0
  const hasOneMaster = hasMasters && masterNodes.length === 1
  const hasMultipleMasters = hasMasters && masterNodes.length >= 1
  const hasWorkers = !!workerNodes && workerNodes.length > 0
  return (
    (hasOneMaster && (!!allowWorkloadsOnMaster || hasWorkers)) ||
    (hasMultipleMasters && !!masterVipIpv4 && !!masterVipIface)
  )
}

const AddBareOsClusterPage = () => {
  const classes = useStyles()
  const { history, match } = useReactRouter()
  const createType = match?.params?.type || ClusterCreateTypes.Custom
  const providerType = match?.params?.platform || CloudProviders.VirtualMachine
  const [activeView, setActiveView] = useState<{ ViewComponent: FC<any> }>(null)
  const [formTitle, setFormTitle] = useState<string>('')
  const [initialContext, setInitialContext] = useState(null)

  useEffect(() => {
    async function loadFile(name, provider) {
      const view = await import(`./create-templates/${provider}-${name}`)
      setActiveView({ ViewComponent: view.default })
      setFormTitle(view.templateTitle)
      setInitialContext(view.initialContext)
    }
    loadFile(createType, providerType)
  }, [createType, providerType])

  // const [nodes, loading, reload] = useDataLoader(loadNodes)
  // const [showDialog, setShowDialog] = useState(false)
  const wizRef = useRef(null)
  const validatorRef = useRef(null)

  useEffect(() => {
    trackEvent('WZ New BareOS Cluster 0 Started', {
      wizard_step: 'Start',
      wizard_state: 'Started',
      wizard_progress: '0 of 6',
      wizard_name: 'Add New BareOS Cluster',
    })
  }, [])

  const onComplete = (_, { uuid }) => history.push(routes.cluster.nodeHealth.path({ id: uuid }))

  const [createBareOSClusterAction, creatingBareOSCluster] = useDataUpdater(
    clusterActions.create,
    onComplete,
  ) // eslint-disable-line

  const handleSubmit = (data) =>
    createBareOSClusterAction({
      ...data,
      clusterType: 'local',
    })
  // useEffect(() => {
  //   wizRef.current && wizRef.current.onNext(handleHasNodesNextCheck)
  // }, [nodes, wizRef])

  const setupValidator = (onNext) => (validate) => {
    wizRef.current = { onNext }
    validatorRef.current = { validate }
  }
  // const handleHasNodesNextCheck = useCallback(() => {
  //   const isValid = validatorRef.current.validate()
  //   if (!isValid) {
  //     // if the form isn't filled out make sure they do that first.
  //     return false
  //   }
  //   if (nodes.filter(allPass([isConnected, isUnassignedNode])).length === 0) {
  //     // if they dont have any nodes then tell them to set that up first before moving forward
  //     setShowDialog(true)
  //     return false
  //   }
  //   return true
  // }, [nodes])

  const title = getFormTitle(formTitle, createType)

  const ViewComponent = activeView?.ViewComponent
  return (
    <FormWrapper title={title} backUrl={listUrl} loading={creatingBareOSCluster}>
      <DocumentMeta title={title} bodyClasses={['form-view']} />
      {!!initialContext && (
        <Wizard
          onComplete={handleSubmit}
          context={initialContext}
          originPath={routes.cluster.add.path({ type: providerType })}
          showFinishAndReviewButton={canFinishAndReview}
        >
          {({ wizardContext, setWizardContext, onNext }) => (
            <WizardMeta
              fields={wizardContext}
              icon={<CloudProviderCard active type={providerType} />}
              calloutFields={['networkPlugin']}
            >
              {ViewComponent && (
                <ViewComponent
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                  onNext={onNext}
                />
              )}
            </WizardMeta>
          )}
        </Wizard>
      )}
    </FormWrapper>
  )
}

export default AddBareOsClusterPage
