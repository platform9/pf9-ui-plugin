import { makeStyles } from '@material-ui/styles'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Theme from 'core/themes/model'
import { masterNodeLengthValidator } from 'core/utils/fieldValidators'
import { allPass } from 'ramda'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import CloudProviderCard from '../common/CloudProviderCard'
import { CloudProviders } from '../infrastructure/cloudProviders/model'
import ClusterHostChooser, {
  isConnected,
  isUnassignedNode,
} from '../infrastructure/clusters/bareos/ClusterHostChooser'
import DownloadOvaWalkthrough from '../infrastructure/nodes/download-ova-walkthrough'
import DownloadCliWalkthrough from '../infrastructure/nodes/DownloadCliWalkthrough'
import { initialContext } from '../infrastructure/clusters/bareos/create-templates/physical-one-click'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { clusterActions } from '../infrastructure/clusters/actions'
import Progress from 'core/components/progress/Progress'
import { ClusterCreateTypes } from '../infrastructure/clusters/model'
import { bareOSClusterTracking } from '../infrastructure/clusters/tracking'

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
}))

type Option = 'ova' | 'cli'

const segmentTrackingFields = {
  platform: CloudProviders.VirtualMachine, // what should I put for this?
  target: ClusterCreateTypes.OneClick,
}

const CreateBareOsClusterPage = ({ onNext, wizardContext, setWizardContext }) => {
  const classes = useStyles()
  const [option, setOption] = useState<Option>('ova')
  const [createCluster, creatingCluster] = useDataUpdater(clusterActions.create)
  const validatorRef = useRef(null)

  const setupValidator = (validate) => {
    validatorRef.current = { validate }
  }

  useEffect(() => {
    bareOSClusterTracking.createStarted(segmentTrackingFields)()
    bareOSClusterTracking.oneClick(segmentTrackingFields)()
  }, [])

  const handleSubmit = useCallback(async () => {
    const isValid = validatorRef.current.validate()
    if (!isValid) {
      return false
    }

    const data = {
      ...initialContext,
      segmentTrackingFields,
      clusterType: 'local',
      name: wizardContext.clusterName,
      kubeRoleVersion: wizardContext.kubeRoleVersion,
      masterNodes: wizardContext.masterNodes,
    }
    await createCluster(data)
    return true
  }, [wizardContext])

  useEffect(() => {
    onNext(handleSubmit)
  }, [handleSubmit])

  return (
    <Progress message={'Creating cluster...'} loading={creatingCluster}>
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
            pollForNodes
            required
          />
        </ValidatedForm>
      </div>
    </Progress>
  )
}

export default CreateBareOsClusterPage
