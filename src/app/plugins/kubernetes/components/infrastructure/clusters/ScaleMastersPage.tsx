import React, { FunctionComponent } from 'react'
import { k8sPrefix } from 'app/constants'
import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'
import FormWrapper from 'core/components/FormWrapper'
import { pathJoin } from 'utils/misc'
import useReactRouter from 'use-react-router'
import useDataLoader from 'core/hooks/useDataLoader'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import BlockChooser from 'core/components/BlockChooser'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
// import { validators, customValidator } from 'core/utils/fieldValidators'
import SubmitButton from 'core/components/buttons/SubmitButton'
import useParams from 'core/hooks/useParams'
import useDataUpdater from 'core/hooks/useDataUpdater'
import ClusterHostChooser, {
  isUnassignedNode,
  inCluster,
  isNotMaster,
} from './bareos/ClusterHostChooser'
import { ICluster } from './model'
import { allPass } from 'ramda'
import Alert from 'core/components/Alert'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    maxWidth: '800px',
  },
  masterCount: {
    margin: theme.spacing(4, 0),
  },
}))

interface IConstraint {
  startNum: number
  desiredNum: number
  relation: 'allow' | 'deny' | 'warn'
  message: string
}

// To eliminate excessive branching logic, an explicit state transition table is used.
export const scaleConstraints: IConstraint[] = [
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

const listUrl = pathJoin(k8sPrefix, 'infrastructure')

interface ScaleMasterProps {
  cluster: ICluster
  onSubmit(data): Promise<void> | void
  onAttach(data): Promise<void> | void
  onDetach(data): Promise<void> | void
}

const ScaleMasters: FunctionComponent<ScaleMasterProps> = ({
  cluster,
  onSubmit,
  onAttach,
  onDetach,
}) => {
  const { params, getParamsUpdater } = useParams()

  // Look up the transition in the state transition table.
  const isMaster = node => node.isMaster === 1 // Backend returns integer 0 and 1 instead of true and false
  const numMasters = (cluster.nodes || []).filter(isMaster).length
  const delta = params.scaleType === 'add' ? 1 : -1
  const desiredMasters = numMasters + delta
  const transition = scaleConstraints.find(t => t.startNum === numMasters && t.desiredNum === desiredMasters)

  const addBareOsMasterNodes = () => {
    const { message, relation } = transition
    if (relation === 'deny') return <Alert message={message} variant="error" />
    return (
      <ValidatedForm onSubmit={params.scaleType === 'add' ? onAttach : onDetach}>
        {relation === 'warn' && <Alert message={message} variant="warning" />}
        <ClusterHostChooser id="mastersToAdd" filterFn={isUnassignedNode} validations={[]} multiple={false} required />
        <SubmitButton>{params.scaleType === 'add' ? 'Add' : 'Remove'} masters</SubmitButton>
      </ValidatedForm>
    )
  }

  const removeBareOsMasterNodes = () => {
    const { message, relation } = transition
    if (relation === 'deny') return <Alert message={message} variant="error" />
    return (
      <ValidatedForm onSubmit={params.scaleType === 'add' ? onAttach : onDetach}>
        {relation === 'warn' && <Alert message={message} variant="warning" />}
        <ClusterHostChooser
          id="mastersToRemove"
          filterFn={allPass([isNotMaster, inCluster(cluster.uuid)])}
          validations={[]}
          multiple={false}
          required
        />
        <SubmitButton>{params.scaleType === 'add' ? 'Add' : 'Remove'} masters</SubmitButton>
      </ValidatedForm>
    )
  }

  return (
    <div>
      {!params.scaleType && (
        <BlockChooser
          onChange={getParamsUpdater('scaleType')}
          options={[
            {
              id: 'add',
              title: 'Add',
              icon: <FontAwesomeIcon size="2x" name="layer-plus" />,
              description: 'Add master nodes to the cluster',
            },
            {
              id: 'remove',
              icon: <FontAwesomeIcon size="2x" name="layer-minus" />,
              title: 'Remove',
              description: 'Remove master nodes from the cluster',
            },
          ]}
        />
      )}
      {!!params.scaleType &&
        (params.scaleType === 'add' ? addBareOsMasterNodes() : removeBareOsMasterNodes())}
    </div>
  )
}

const ScaleMastersPage: FunctionComponent = () => {
  const classes = useStyles({})
  const { match, history } = useReactRouter()
  const { id } = match.params
  const [clusters, loading] = useDataLoader(clusterActions.list)

  const onComplete = () => history.push(listUrl)
  const [update, updating] = useDataUpdater(clusterActions.update, onComplete)

  // TypeScript is not able to infer that the customOperations are actually there so we need to work around it
  const anyClusterActions = clusterActions as any
  const [attach, isAttaching] = useDataUpdater(anyClusterActions.attachNodes, onComplete)
  const [detach, isDetaching] = useDataUpdater(anyClusterActions.detachNodes, onComplete)

  const isUpdating = updating || isAttaching || isDetaching

  const cluster = clusters.find((x) => x.uuid === id)

  const handleSubmit = async (data): Promise<void> => {
    await update({ ...cluster, ...data })
  }

  const handleAttach = (data: { mastersToAdd: string[] }) => {
    const uuids = data.mastersToAdd
    const nodes = uuids.map((uuid) => ({ uuid, isMaster: true }))
    return attach({ cluster, nodes })
  }

  const handleDetach = (data: { mastersToRemove: string[] }) => {
    const uuids = data.mastersToRemove
    return detach({ cluster, nodes: uuids })
  }

  return (
    <FormWrapper
      className={classes.root}
      title="Scale Masters"
      backUrl={listUrl}
      loading={loading || isUpdating}
      renderContentOnMount={false}
      message={isUpdating ? 'Scaling cluster...' : 'Loading cluster...'}
    >
      <ScaleMasters
        cluster={cluster}
        onSubmit={handleSubmit}
        onAttach={handleAttach}
        onDetach={handleDetach}
      />
    </FormWrapper>
  )
}

export default ScaleMastersPage
