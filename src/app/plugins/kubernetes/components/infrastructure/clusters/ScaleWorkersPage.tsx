import React, { FunctionComponent } from 'react'
import { k8sPrefix } from 'app/constants'
import { makeStyles } from '@material-ui/styles'
import FormWrapper from 'core/components/FormWrapper'
import { pathJoin } from 'utils/misc'
import useReactRouter from 'use-react-router'
import useDataLoader from 'core/hooks/useDataLoader'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import { Typography, Theme } from '@material-ui/core'
import BlockChooser from 'core/components/BlockChooser'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import { validators, customValidator } from 'core/utils/fieldValidators'
import SubmitButton from 'core/components/buttons/SubmitButton'
import useParams from 'core/hooks/useParams'
import useDataUpdater from 'core/hooks/useDataUpdater'
import ClusterHostChooser, { isUnassignedNode, inCluster, isNotMaster } from './bareos/ClusterHostChooser'
import { ICluster } from './model'
import { allPass } from 'ramda'

// Limit the number of workers that can be scaled at a time to prevent overload
const MAX_SCALE_AT_A_TIME = 15

const maxScaleValidator = customValidator(
  (selections) => selections.length <= MAX_SCALE_AT_A_TIME,
  `Clusters can only be scaled up to ${MAX_SCALE_AT_A_TIME} nodes at a time.`
)

const minScaleValidator = customValidator(
  (selections) => selections.length > 0,
  'You must select at least 1 node.'
)

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    maxWidth: '800px',
  },
  workerCount: {
    margin: theme.spacing(4, 0),
  },
}))

const listUrl = pathJoin(k8sPrefix, 'infrastructure')

const clusterTypeDisplay = {
  local: 'BareOS',
  aws: 'AWS',
  azure: 'Azure',
}

interface ScaleWorkersProps {
  cluster: ICluster
  onSubmit(data): Promise<void> | void
  onAttach(data): Promise<void> | void
  onDetach(data): Promise<void> | void
}

const ScaleWorkers: FunctionComponent<ScaleWorkersProps> = ({ cluster, onSubmit, onAttach, onDetach }) => {
  const classes = useStyles({})
  const { params, getParamsUpdater } = useParams()
  const { name, cloudProviderType } = cluster
  const isLocal = cloudProviderType === 'local'
  const isCloud = ['aws', 'azure'].includes(cloudProviderType)
  const type: string = clusterTypeDisplay[cloudProviderType]

  const calcMin = (value: number): number =>
    params.scaleType === 'add' ? value : Math.max(value - MAX_SCALE_AT_A_TIME, 1)

  const calcMax = (value: number): number =>
    params.scaleType === 'add' ? value + MAX_SCALE_AT_A_TIME : value

  const chooseScaleNum = (
    <ValidatedForm initialValues={cluster} onSubmit={onSubmit}>
      {!cluster.enableCAS && (
        <TextField
          id="numWorkers"
          type="number"
          label="Number of worker nodes"
          info="Number of worker nodes to deploy."
          required
          validations={[
            validators.rangeValue(calcMin(cluster.numWorkers), calcMax(cluster.numWorkers)),
          ]}
        />
      )}

      {!!cluster.enableCAS && (
        <>
          <TextField
            id="numMinWorkers"
            type="number"
            label="Minimum number of worker nodes"
            info="Minimum number of worker nodes this cluster may be scaled down to."
            validations={[
              validators.rangeValue(calcMin(cluster.numMinWorkers), calcMax(cluster.numMinWorkers)),
            ]}
            required
          />

          <TextField
            id="numMaxWorkers"
            type="number"
            label="Maximum number of worker nodes"
            info="Maximum number of worker nodes this cluster may be scaled up to."
            validations={[
              validators.rangeValue(calcMin(cluster.numMaxWorkers), calcMax(cluster.numMaxWorkers)),
            ]}
            required
          />
        </>
      )}
      <SubmitButton>{params.scaleType === 'add' ? 'Add' : 'Remove'} workers</SubmitButton>
    </ValidatedForm>
  )

  const addBareOsWorkerNodes = (
    <ValidatedForm onSubmit={params.scaleType === 'add' ? onAttach : onDetach}>
      <ClusterHostChooser
        id="workersToAdd"
        filterFn={isUnassignedNode}
        validations={[minScaleValidator, maxScaleValidator]}
        required
      />
      <SubmitButton>{params.scaleType === 'add' ? 'Add' : 'Remove'} workers</SubmitButton>
    </ValidatedForm>
  )

  const removeBareOsWorkerNodes = (
    <ValidatedForm onSubmit={params.scaleType === 'add' ? onAttach : onDetach}>
      <ClusterHostChooser
        id="workersToRemove"
        filterFn={allPass([
          isNotMaster,
          inCluster(cluster.uuid)
        ])}
        validations={[minScaleValidator, maxScaleValidator]}
        required
      />
      <SubmitButton>{params.scaleType === 'add' ? 'Add' : 'Remove'} workers</SubmitButton>
    </ValidatedForm>
  )

  return (
    <div>
      {!!params.scaleType || (
        <BlockChooser
          onChange={getParamsUpdater('scaleType')}
          options={[
            {
              id: 'add',
              title: 'Add',
              icon: <FontAwesomeIcon size="2x" name="layer-plus" />,
              description: 'Add worker nodes to the cluster',
            },
            {
              id: 'remove',
              icon: <FontAwesomeIcon size="2x" name="layer-minus" />,
              title: 'Remove',
              description: 'Remove worker nodes from the cluster',
            },
          ]}
        />
      )}
      {isCloud && (
        <>
          <div>
            <Typography variant="subtitle1">
              Scale worker nodes for cluster <b>{name}</b> of type <i>{type}</i>
            </Typography>
          </div>
          <div className={classes.workerCount}>
            <Typography variant="subtitle1">
              You currently have <b>{cluster.numWorkers}</b> worker nodes.
            </Typography>
          </div>
          {params.scaleType && chooseScaleNum}
        </>
      )}
      {isLocal &&
        !!params.scaleType &&
        (params.scaleType === 'add' ? addBareOsWorkerNodes : removeBareOsWorkerNodes)}
    </div>
  )
}

const ScaleWorkersPage: FunctionComponent = () => {
  const classes = useStyles({})
  const { match, history } = useReactRouter()
  const { id } = match.params
  const [clusters, loading] = useDataLoader(clusterActions.list)

  const onComplete = () => history.push(listUrl)
  const [update, updating] = useDataUpdater(clusterActions.update, onComplete)

  // TypeScript is not able to infer that the customOperations are actually there so we need to work around it
  const [attach, isAttaching] = useDataUpdater((clusterActions as any).attachNodes, onComplete)
  const [detach, isDetaching] = useDataUpdater((clusterActions as any).detachNodes, onComplete)

  const isUpdating = updating || isAttaching || isDetaching

  const cluster = clusters.find((x) => x.uuid === id)

  const handleSubmit = async (data): Promise<void> => {
    await update({ ...cluster, ...data })
  }

  const handleAttach = (data: { workersToAdd: string[] }) => {
    const uuids = data.workersToAdd
    const nodes = uuids.map(uuid => ({ uuid, isMaster: false }))
    return attach({ cluster, nodes })
  }

  const handleDetach = (data: { workersToRemove: string[] }) => {
    const uuids = data.workersToRemove
    return detach({ cluster, nodes: uuids })
  }

  return (
    <FormWrapper
      className={classes.root}
      title="Scale Workers"
      backUrl={listUrl}
      loading={loading || isUpdating}
      renderContentOnMount={false}
      message={isUpdating ? 'Scaling cluster...' : 'Loading cluster...'}
    >
      <ScaleWorkers cluster={cluster} onSubmit={handleSubmit} onAttach={handleAttach} onDetach={handleDetach} />
    </FormWrapper>
  )
}

export default ScaleWorkersPage
