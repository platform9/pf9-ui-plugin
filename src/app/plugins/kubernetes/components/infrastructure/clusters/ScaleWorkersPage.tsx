import React, { useState } from 'react'
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
import { validators } from 'core/utils/fieldValidators'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { spacing } from 'material-ui/styles'

// Limit the number of workers that can be scaled at a time to prevent overload
const MAX_SCALE_AT_A_TIME = 15

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
  }
}))

const listUrl = pathJoin(k8sPrefix, 'infrastructure')
const clusterTypeDisplay = {
  local: 'BareOS',
  aws: 'AWS',
  azure: 'Azure',
}

const ScaleWorkers = ({ cluster }) => {
  const classes = useStyles({})
  const [scaleType, setScaleType] = useState(null)
  const { name, cloudProviderType } = cluster
  const isLocal = cloudProviderType === 'local'
  const isCloud = ['aws', 'azure'].includes(cloudProviderType)
  const type: string = clusterTypeDisplay[cloudProviderType]

  const handleSubmit = data => {
    console.log(data)
  }

  const chooseType = (
    <div>
      <BlockChooser
        onChange={setScaleType}
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
          }
        ]}
      />
    </div>
  )

  const chooseScaleNum = (
    <ValidatedForm initialValues={cluster} onSubmit={handleSubmit}>
      {!cluster.enableCAS &&
        <TextField
          id="numWorkers"
          type="number"
          label="Number of worker nodes"
          info="Number of worker nodes to deploy."
          required
          validations={[
            validators.minValue(cluster.numWorkers),
            validators.maxValue(cluster.numWorkers + MAX_SCALE_AT_A_TIME),
          ]}
        />
      }

      {!!cluster.enableCAS && (
        <>
          <TextField
            id="numMinWorkers"
            type="number"
            label="Minimum number of worker nodes"
            info="Minimum number of worker nodes this cluster may be scaled down to."
            validations={[
              validators.minValue(cluster.numMinWorkers),
              validators.maxValue(cluster.numMinWorkers + MAX_SCALE_AT_A_TIME),
            ]}
            required
          />

          <TextField
            id="numMaxWorkers"
            type="number"
            label="Maximum number of worker nodes"
            info="Maximum number of worker nodes this cluster may be scaled up to."
            validations={[
              validators.maxValue(cluster.numMaxWorkers + MAX_SCALE_AT_A_TIME),
            ]}
            required
          />
        </>
      )}
      <SubmitButton>{scaleType === 'add' ? 'Add' : 'Remove'} workers</SubmitButton>
    </ValidatedForm>
  )

  return (
    <div>
      {isCloud &&
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
          {scaleType ? chooseScaleNum : chooseType}
        </>
      }
      {isLocal &&
        <div>
          TODO
        </div>
      }
    </div>
  )
}

const ScaleWorkersPage = () => {
  const classes = useStyles({})
  const { id } = useReactRouter().match.params
  const [clusters, loading] = useDataLoader(clusterActions.list)
  const cluster = clusters.find(x => x.uuid === id)

  return (
    <FormWrapper
      className={classes.root}
      title="Scale Workers"
      backUrl={listUrl}
      loading={loading}
      renderContentOnMount={false}
      message="Loading cluster..."
    >
      <ScaleWorkers cluster={cluster} />
    </FormWrapper>
  )
}

export default ScaleWorkersPage
