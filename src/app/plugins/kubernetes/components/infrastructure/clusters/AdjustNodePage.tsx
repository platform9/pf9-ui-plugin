import React from 'react'
import useReactRouter from 'use-react-router'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import FormWrapper from 'core/components/FormWrapper'
import { k8sPrefix } from 'app/constants'
import { pathJoin } from 'utils/misc'
import useDataUpdater from 'core/hooks/useDataUpdater'
import useDataLoader from 'core/hooks/useDataLoader'
import { Radio, RadioGroup, FormControlLabel, FormControl, Typography, makeStyles, Theme } from '@material-ui/core'
import useParams from 'core/hooks/useParams'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import Alert from 'core/components/Alert'
import SubmitButton from 'core/components/buttons/SubmitButton'
import ClusterHostChooser, {
  isUnassignedNode, inCluster, isNotMaster
} from './bareos/ClusterHostChooser'
import { allPass } from 'ramda'
import TextField from 'core/components/validatedForm/TextField'
import { validators, customValidator } from 'core/utils/fieldValidators'
import { CloudProviders, ICluster } from './model'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'

type NodeType = 'master' | 'worker'
type ScaleType = 'up' | 'down'

type ActionButtonLabel = 'Add Master' | 'Add Worker' | 'Remove Master' | 'Remove Worker'
type FGetButtonLabel = (scaleType: ScaleType, nodeType: NodeType) => ActionButtonLabel
type FHandleSubmit = (data: { nodesToUpdate: string[] }) => void

interface IInitialState {
  nodeType: NodeType
  scaleType: ScaleType
}
interface IConstraint {
  startNum: number
  desiredNum: number
  relation: 'allow' | 'deny' | 'warn'
  message: string
}

interface IScaleTypeRadioGroupProps {
  scaleType: ScaleType
  handleScaleTypeChange: (key: string) => any
}

interface INodeTypeRadioGroupProps {
  nodeType: NodeType
  handleNodeTypeChange: (key: string) => any
}

const initialState: IInitialState = {
  nodeType: 'worker',
  scaleType: 'up'
}

interface IScaleNodeListPickerProps {
  transition: IConstraint
  nodeType: NodeType
  scaleType: ScaleType
  cluster: ICluster
}

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    marginTop: theme.spacing(4),
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    maxWidth: '800px',
  },
  workerCount: {
    margin: theme.spacing(2, 0),
  },
  formWidth: {
    width: 715
  },
  tableWidth: {
    width: 560,
  },
  inputWidth: {
    maxWidth: 350,
    marginBottom: theme.spacing(3)
  },
  submit: {
    display: 'flex',
    marginLeft: theme.spacing(2),
  }
}))

const listUrl = pathJoin(k8sPrefix, 'infrastructure')

// Limit the number of workers that can be scaled at a time to prevent overload
const MAX_SCALE_AT_A_TIME = 15

const calcMin = (value: number, scaleType: ScaleType): number =>
  scaleType === 'up' ? value : Math.max(value - MAX_SCALE_AT_A_TIME, 1)

const calcMax = (value: number, scaleType: ScaleType): number =>
  scaleType === 'up' ? value + MAX_SCALE_AT_A_TIME : value

const maxScaleValidator = customValidator(
  (selections) => selections.length <= MAX_SCALE_AT_A_TIME,
  `Clusters can only be scaled up to ${MAX_SCALE_AT_A_TIME} nodes at a time.`
)

const minScaleValidator = customValidator(
  (selections) => selections.length > 0,
  'You must select at least 1 node.'
)

const clusterTypeDisplay = {
  local: 'BareOS',
  aws: 'AWS',
  azure: 'Azure',
}

const canScaleMasters = (cluster) => cluster.taskStatus === 'success' && cluster.cloudProviderType === CloudProviders.BareOS && (cluster.nodes || []).length > 1
const canScaleWorkers = (cluster) => cluster.taskStatus === 'success' && cluster.cloudProviderType !== CloudProviders.Azure

// To eliminate excessive branching logic, an explicit state transition table is used.
const scaleConstraints: IConstraint[] = [
  // shrink
  { startNum: 1, desiredNum: 0, relation: 'deny', message: 'You cannot remove master node from a single master cluster.  If you wish to delete the cluster, please choose the ‘delete’ operation on the cluster on the infrastructure page instead.' },
  { startNum: 2, desiredNum: 1, relation: 'warn', message: 'Removing this master node will reduce the total number of masters in this cluster down to 1.  For cluster high availability we recommend always having 3 masters nodes in a cluster.' },
  { startNum: 3, desiredNum: 2, relation: 'warn', message: 'For high availability, we recommend having at least 3 masters in a cluster at any time. Removing this master will result in an even number of masters for this cluster (2 master nodes after removal of this node).  We recommend having an odd number of masters for your cluster at any time.' },
  { startNum: 4, desiredNum: 3, relation: 'allow', message: '' },
  { startNum: 5, desiredNum: 4, relation: 'warn', message: 'Removing this master node will result in an even number of master nodes for this cluster (4 master nodes after removal of this node).  We recommend having an odd number of masters for your cluster at any time.' },

  // grow
  { startNum: 1, desiredNum: 2, relation: 'deny', message: 'You cannot add master nodes to a single master cluster.  You need to create a multi-master cluster with at least 2 masters before you can add more masters to the cluster.' },
  { startNum: 2, desiredNum: 3, relation: 'allow', message: '' },
  { startNum: 3, desiredNum: 4, relation: 'warn', message: 'Adding this master node will result in an even number of master nodes for this cluster (4 master nodes after adding of this node).  We recommend having an odd number of masters for your cluster at any time.' },
  { startNum: 4, desiredNum: 5, relation: 'allow', message: '' },
  { startNum: 5, desiredNum: 6, relation: 'deny', message: '5 master nodes is the max.  You cannot add more.' },
]

const getButtonLabel: FGetButtonLabel = (scaleType, nodeType) => {
  if (scaleType === 'up') return nodeType === 'master' ? 'Add Master' : 'Add Worker'

  return nodeType === 'master' ? 'Remove Master' : 'Remove Worker'
}

const isMaster = node => node.isMaster === 1 // Backend returns integer 0 and 1 instead of true and false

const ScaleNodeListPicker: React.FC<IScaleNodeListPickerProps> = ({ scaleType, nodeType, cluster, transition }) => {
  const classes = useStyles({})
  const { message, relation } = transition || {}
  const { name, cloudProviderType } = cluster
  const isLocal = cloudProviderType === CloudProviders.BareOS
  const type: string = clusterTypeDisplay[cloudProviderType]
  const canScaleWorker = isLocal && canScaleWorkers(cluster)
  const getNodeFilter = scaleType === 'up' ? isUnassignedNode : allPass([isNotMaster, inCluster(cluster.uuid)])

  if (nodeType === 'worker') {
    return (<>
      {!isLocal &&
        <>
          <div>
            <Typography variant="subtitle1">
              Scale worker nodes for cluster <b>{name}</b> of type <i>{type}</i>
            </Typography>
          </div>
          <div className={classes.workerCount}>
            <Typography variant="subtitle1">You currently have <b>{cluster.numWorkers}</b> worker nodes.</Typography>
          </div>
          <div className={classes.inputWidth}>
            {!cluster.enableCAS &&
              <TextField
                id="numWorkers"
                type="number"
                label="Number of worker nodes"
                info="Number of worker nodes to deploy."
                required
                validations={[
                  validators.rangeValue(calcMin(cluster.numWorkers, scaleType), calcMax(cluster.numWorkers, scaleType)),
                ]}
              />
            }
            {!!cluster.enableCAS &&
              <>
                <TextField
                  id="numMinWorkers"
                  type="number"
                  label="Minimum number of worker nodes"
                  info="Minimum number of worker nodes this cluster may be scaled down to."
                  validations={[
                    validators.rangeValue(calcMin(cluster.numMinWorkers, scaleType), calcMax(cluster.numMinWorkers, scaleType)),
                  ]}
                  required
                />
                <TextField
                  id="numMaxWorkers"
                  type="number"
                  label="Maximum number of worker nodes"
                  info="Maximum number of worker nodes this cluster may be scaled up to."
                  validations={[
                    validators.rangeValue(calcMin(cluster.numMaxWorkers, scaleType), calcMax(cluster.numMaxWorkers, scaleType)),
                  ]}
                  required
                />
              </>
            }
          </div>
        </>
      }
      {canScaleWorker && relation === 'warn' && <Alert message={message} variant="warning" />}
      {canScaleWorker &&
        <div className={classes.tableWidth}>
          <ClusterHostChooser id='nodesToUpdate' filterFn={getNodeFilter} validations={[minScaleValidator, maxScaleValidator]} required multiple pollForNodes />
        </div>
      }
    </>)
  }

  if (relation === 'deny') return <Alert message={message} variant="error" />

  if (!canScaleMasters(cluster)) return <Alert message="Scale master operation is not valid for this cluster. Please check your cluster status and the number of master nodes are valid" variant="error" />

  return (<div className={classes.tableWidth}>
      <ClusterHostChooser id='nodesToUpdate' filterFn={getNodeFilter} required multiple pollForNodes />
    </div>
  )
}

const ScaleTypeRadioGroup: React.FC<IScaleTypeRadioGroupProps> = ({ scaleType, handleScaleTypeChange }) => (
  <>
    <Typography component="div" variant="subtitle2">Scale Cluster</Typography>
    <RadioGroup aria-label="scaleType" name="scaleType" row value={scaleType} onChange={handleScaleTypeChange('scaleType')}>
      <FormControlLabel
        value="up"
        control={<Radio color="primary" />}
        label="Up"
        labelPlacement="start"
      />
      <FormControlLabel
        value="down"
        control={<Radio color="primary" />}
        label="Down"
        labelPlacement="start"
      />
    </RadioGroup>
  </>
)

const NodeTypeRadioGroup: React.FC<INodeTypeRadioGroupProps> = ({ nodeType, handleNodeTypeChange }) => (
  <>
    <Typography component="div" variant="subtitle2">Scale Node</Typography>
    <RadioGroup aria-label="scaleNodeType" name="scaleNodeType" row value={nodeType} onChange={handleNodeTypeChange('nodeType')}>
      <FormControlLabel
        value="master"
        control={<Radio color="primary" />}
        label="Master"
        labelPlacement="start"
      />
      <FormControlLabel
        value="worker"
        control={<Radio color="primary" />}
        label="Worker"
        labelPlacement="start"
      />
    </RadioGroup>
  </>
)

const AdjustNodePage: React.FC<{}> = () => {
  const { params, updateParams } = useParams(initialState)
  const { match, history } = useReactRouter()
  const classes = useStyles({})
  const onComplete = () => history.push(listUrl)
  const { nodeType, scaleType } = params

  const [clusters, loading] = useDataLoader(clusterActions.list)
  const cluster = clusters.find((x) => x.uuid === match.params.id) || {}

  // Look up the transition in the state transition table.
  const numMasters: number = (cluster.nodes || []).filter(isMaster).length
  const delta: number = scaleType === 'up' ? 1 : -1
  const desiredMasters = numMasters + delta
  const transition = scaleConstraints.find(t => t.startNum === numMasters && t.desiredNum === desiredMasters)

  const anyClusterActions = clusterActions as any
  const [attach, isAttaching] = useDataUpdater(anyClusterActions.attachNodes, onComplete)
  const [detach, isDetaching] = useDataUpdater(anyClusterActions.detachNodes, onComplete)
  const [update, isUpdating] = useDataUpdater(clusterActions.update, onComplete)
  const isLocal = cluster?.cloudProviderType === CloudProviders.BareOS
  const isLoading = loading || isAttaching || isDetaching || isUpdating

  const handleUpdateCluster = async (data): Promise<void> => {
    await update({ ...cluster, ...data })
  }

  const handleSubmit: FHandleSubmit = (data) => {
    if (!isLocal) {
      return handleUpdateCluster(data)
    }

    const uuids = data.nodesToUpdate

    if (scaleType === 'down') return detach({ cluster, nodes: uuids })

    const isMaster = nodeType === 'master' || false
    const nodes = uuids.map((uuid) => ({ uuid, isMaster }))
    attach({ cluster, nodes })
  }

  const handleChange = key => e => updateParams({ [key]: e.target.value })

  const canSubmit = nodeType === 'master' ? canScaleMasters(cluster) && transition.relation !== 'deny' : canScaleWorkers(cluster)

  return (
    <FormWrapper className="" title="Adjust node for cluster" backUrl={listUrl} loading={isLoading} message={loading ? 'Loading...' : 'Scaling cluster...'}>
      <ValidatedForm
        initialValues={params}
        onSubmit={handleSubmit}
      >
        <div className={classes.formWidth}>
          <FormFieldCard title="Scale" >
            <FormControl component="fieldset">
              <ScaleTypeRadioGroup scaleType={scaleType} handleScaleTypeChange={handleChange} />
              <NodeTypeRadioGroup nodeType={nodeType} handleNodeTypeChange={handleChange} />
              <ScaleNodeListPicker nodeType={nodeType} scaleType={scaleType} cluster={cluster} transition={transition} />
            </FormControl>
          </FormFieldCard>
          <div className={classes.submit}>
            {canSubmit && <SubmitButton>{getButtonLabel(scaleType, nodeType)}</SubmitButton>}
          </div>
        </div>
      </ValidatedForm>
    </FormWrapper>
  )
}

export default AdjustNodePage
