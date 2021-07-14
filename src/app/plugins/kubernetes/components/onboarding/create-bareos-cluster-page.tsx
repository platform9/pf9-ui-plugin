import { makeStyles } from '@material-ui/styles'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Theme from 'core/themes/model'
import { masterNodeLengthValidator } from 'core/utils/fieldValidators'
import { allPass, sort } from 'ramda'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import CloudProviderCard from '../common/CloudProviderCard'
import { CloudProviders } from '../infrastructure/cloudProviders/model'
import ClusterHostChooser, {
  isConnected,
  isUnassignedNode,
} from '../infrastructure/clusters/bareos/ClusterHostChooser'
import { initialContext } from '../infrastructure/clusters/bareos/create-templates/physical-one-click'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { clusterActions, loadSupportedRoleVersions } from '../infrastructure/clusters/actions'
import { ClusterCreateTypes } from '../infrastructure/clusters/model'
import { bareOSClusterTracking } from '../infrastructure/clusters/tracking'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import DownloadOvaWalkthrough from './download-ova-walkthrough'
import DownloadCliWalkthrough from './download-cli-walkthrough'
import useDataLoader from 'core/hooks/useDataLoader'
import { compareVersions } from 'k8s/util/helpers'
import { sessionActions } from 'core/session/sessionReducers'
import { useDispatch } from 'react-redux'
import { routes } from 'core/utils/routes'

const useStyles = makeStyles((theme: Theme) => ({
  connectNodesContainer: {
    width: '800px',
  },
  connectionChoices: {
    maxWidth: '800px',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, 242px)',
    gridGap: theme.spacing(2),
  },
  button: {
    gridColumn: '2',
    marginTop: theme.spacing(3),
    width: 'max-content',
  },
  linkText: {
    textDecoration: 'underline',
    color: theme.palette.primary.main,
  },
  spaceAbove: {
    marginTop: theme.spacing(2),
  },
  downloadIcon: {
    marginLeft: theme.spacing(1),
  },
  downloadButton: {
    marginTop: theme.spacing(1),
  },
}))

type Option = 'ova' | 'cli'

const segmentTrackingFields = {
  platform: CloudProviders.VirtualMachine, // what should I put for this?
  target: ClusterCreateTypes.OneClick,
}

const CreateBareOsClusterPage = ({
  onNext,
  wizardContext,
  setWizardContext,
  setSubmitting,
  setClusterId,
}) => {
  const classes = useStyles()
  const [option, setOption] = useState<Option>('ova')
  const dispatch = useDispatch()
  const onComplete = (success, cluster) => {
    if (!success) return
    const clusterNodeUrl = routes.cluster.nodeHealth.path({ id: cluster?.uuid })
    dispatch(sessionActions.updateSession({ onboardingRedirectToUrl: clusterNodeUrl }))
    setClusterId(cluster?.uuid)
  }
  const [createCluster] = useDataUpdater(clusterActions.create, onComplete)
  const validatorRef = useRef(null)

  const setupValidator = (validate) => {
    validatorRef.current = { validate }
  }

  const [kubernetesVersions] = useDataLoader(loadSupportedRoleVersions)
  const defaultKubernetesVersion = useMemo(() => {
    const versionsList = kubernetesVersions?.map((obj) => obj.roleVersion) || []
    const sortedVersions = sort(compareVersions, versionsList) // this sorts the versions from low-high
    return sortedVersions[sortedVersions.length - 1]
  }, [kubernetesVersions])

  useEffect(() => {
    bareOSClusterTracking.createStarted(segmentTrackingFields)()
    bareOSClusterTracking.oneClick(segmentTrackingFields)()
  }, [])

  const handleSubmit = useCallback(async () => {
    const isValid = validatorRef.current.validate()
    if (!isValid) {
      return false
    }
    setSubmitting(true)
    const data = {
      ...initialContext,
      segmentTrackingFields,
      clusterType: 'local',
      kubeRoleVersion: defaultKubernetesVersion,
      name: wizardContext.clusterName,
      masterNodes: wizardContext.masterNodes,
    }
    await createCluster(data)
    setSubmitting(false)
    return true
  }, [validatorRef.current, setSubmitting, defaultKubernetesVersion, wizardContext])

  useEffect(() => {
    onNext(handleSubmit)
  }, [handleSubmit])

  return (
    <div className={classes.connectNodesContainer}>
      <div className={classes.connectionChoices}>
        <CloudProviderCard
          type={CloudProviders.VirtualMachine}
          label="VM Template/OVA"
          active={option === 'ova'}
          onClick={(type) => setOption('ova')}
        />
        <CloudProviderCard
          type={CloudProviders.PhysicalMachine}
          label="Existing Virtual or Physical Infrastructure"
          active={option === 'cli'}
          onClick={(type) => setOption('cli')}
        />
      </div>
      <FormFieldCard title="Attach a master node">
        {option === 'ova' ? <DownloadOvaWalkthrough /> : <DownloadCliWalkthrough />}
        <ValidatedForm
          title="Waiting for your Ubuntu/CentOs Node to Attach"
          elevated={false}
          triggerSubmit={setupValidator}
        >
          <ClusterHostChooser
            id="masterNodes"
            selection="single"
            filterFn={allPass([isConnected, isUnassignedNode])}
            onChange={(value) => setWizardContext({ masterNodes: value })}
            validations={[masterNodeLengthValidator]}
            isSingleNodeCluster
            pollForNodes
            required
          />
        </ValidatedForm>
      </FormFieldCard>
    </div>
  )
}

export default CreateBareOsClusterPage
