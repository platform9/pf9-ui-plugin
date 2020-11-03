import React, { FunctionComponent, useCallback, useEffect, useState } from 'react'
import { k8sPrefix } from 'app/constants'
import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'
import Text from 'core/elements/text'
import FormWrapper from 'core/components/FormWrapper'
import { pathJoin } from 'utils/misc'
import useReactRouter from 'use-react-router'
import useDataLoader from 'core/hooks/useDataLoader'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import BlockChooser from 'core/components/BlockChooser'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import SubmitButton from 'core/components/buttons/SubmitButton'
import useParams from 'core/hooks/useParams'
import useDataUpdater from 'core/hooks/useDataUpdater'
import ClusterHostChooser, {
  isUnassignedNode,
  inCluster,
  isMaster,
} from './bareos/ClusterHostChooser'
import { IClusterSelector } from './model'
import { allPass } from 'ramda'
import { customValidator } from 'core/utils/fieldValidators'
import { CloudProviders } from '../cloudProviders/model'
import Alert from 'core/components/Alert'
import { hasConvergingNodes } from './ClusterStatusUtils'

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

// Quorum Messages
const zeroMasterMsg =
  'You cannot remove master node from a single master cluster.  If you wish to delete the cluster, please choose the ‘delete’ operation on the cluster on the infrastructure page instead.'
const oneMasterMsg =
  'Quorum Risk. A single master cluster is not recommended for production environments. An outage of the master will bring the cluster offline. Recommended for test environments only.'
const twoMastersMsg =
  'Quorum Risk. A two master cluster does not hold quorum. Losing 1 master will cause the Kubernetes cluster to not function.'
const threeMastersMsg = 'Quorum Achieved with a tolerance of 1.'
const fourMastersMsg =
  'Quorum Achieved with a tolerance of 1. Operating four masters can tolerate a loss of at  most 1 node as quorum is majority, 3 of 4.'
const fiveMastersMsg = 'Quorum Achieved with a tolerance of 2.'

interface IConstraint {
  startNum: number
  desiredNum: number
  relation: 'allow' | 'deny' | 'warn'
  message: string
}

// To eliminate excessive branching logic, an explicit state transition table is used.
export const scaleConstraints: IConstraint[] = [
  // shrink
  {
    startNum: 5,
    desiredNum: 4,
    relation: 'allow',
    message: fourMastersMsg,
  },
  {
    startNum: 4,
    desiredNum: 3,
    relation: 'allow',
    message: threeMastersMsg,
  },
  {
    startNum: 3,
    desiredNum: 2,
    relation: 'allow',
    message: twoMastersMsg,
  },
  {
    startNum: 2,
    desiredNum: 1,
    relation: 'allow',
    message: oneMasterMsg,
  },
  {
    startNum: 1,
    desiredNum: 0,
    relation: 'deny',
    message: zeroMasterMsg,
  },

  // grow
  {
    startNum: 1,
    desiredNum: 2,
    relation: 'allow',
    message: twoMastersMsg,
  },
  {
    startNum: 2,
    desiredNum: 3,
    relation: 'allow',
    message: threeMastersMsg,
  },
  {
    startNum: 3,
    desiredNum: 4,
    relation: 'allow',
    message: fourMastersMsg,
  },
  {
    startNum: 4,
    desiredNum: 5,
    relation: 'allow',
    message: fiveMastersMsg,
  },
]

const listUrl = pathJoin(k8sPrefix, 'infrastructure')

interface ScaleMasterProps {
  cluster: IClusterSelector

  onSubmit(data): Promise<void> | void

  onAttach(data): Promise<void> | void

  onDetach(data): Promise<void> | void
}

const defaultErrorMessage = 'You must have 1, 3 or 5 masters to hold quorum'

const ScaleMasters: FunctionComponent<ScaleMasterProps> = ({
  cluster,
  onSubmit,
  onAttach,
  onDetach,
}) => {
  const { params, getParamsUpdater } = useParams()
  const [selectedNode, setSelectedNode] = useState(null)

  const hasMasterVip = cluster.masterVipIpv4 !== ''
  const numMasters = (cluster.nodes || []).filter(isMaster).length
  const numToChange = params.scaleType === 'add' ? 1 : -1
  const totalMasters = numMasters + numToChange
  // Look up the transition in the state transition table.
  const transitionConstraint =
    scaleConstraints.find(
      (t) => t.startNum === numMasters && t.desiredNum === totalMasters,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    ) || ({} as IConstraint)

  useEffect(() => {
    setSelectedNode(null)
  }, [params.scaleType])

  const clusterAndNodeStatusValidator = useCallback(() => {
    return customValidator(() => {
      return (
        cluster.status === 'ok' &&
        cluster.taskStatus === 'success' &&
        cluster.masterNodesHealthStatus === 'healthy' &&
        !hasConvergingNodes(cluster.nodes)
      )
    }, 'Unable to scale nodes. All nodes must be converged and healthy')
  }, [cluster, params])()

  const masterNodeLengthValidator = useCallback(() => {
    return customValidator(() => {
      return transitionConstraint.relation === 'allow'
    }, defaultErrorMessage)
  }, [cluster, params])()

  const bareOsValidator = useCallback(() => {
    return customValidator(() => {
      // BareOs clusters with single master node cannot scale without a virtial IP
      return cluster.cloudProviderType === CloudProviders.BareOS && (numMasters > 1 || hasMasterVip)
    }, 'No Virtual IP Detected. To scale Masters a Virtual IP is required. Please recreate this cluster and provide a Virtual IP on the Network step')
  }, [cluster, params])()

  return (
    <div>
      <Text variant="subtitle1">Current Masters: {numMasters}</Text>

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

      {!!params.scaleType && (
        <ValidatedForm
          onSubmit={params.scaleType === 'add' ? onAttach : onDetach}
          title={`Choose nodes to ${params.scaleType}`}
        >
          <ClusterHostChooser
            id={params.scaleType === 'add' ? 'mastersToAdd' : 'mastersToRemove'}
            selection="single"
            filterFn={
              params.scaleType === 'add'
                ? isUnassignedNode
                : allPass([isMaster, inCluster(cluster.uuid)])
            }
            validations={[
              clusterAndNodeStatusValidator,
              masterNodeLengthValidator,
              bareOsValidator,
            ]}
            onChange={(value) => setSelectedNode(value)}
            required
          />
          {selectedNode && <Alert small variant="warning" message={transitionConstraint.message} />}
          <SubmitButton>{params.scaleType === 'add' ? 'Add' : 'Remove'} masters</SubmitButton>
        </ValidatedForm>
      )}
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
    const uuid = cluster.uuid
    await update({ uuid, ...data })
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
      renderContentOnMount={!!cluster}
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
