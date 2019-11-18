import React from 'react'
import { k8sPrefix } from 'app/constants'
import { makeStyles } from '@material-ui/styles'
import FormWrapper from 'core/components/FormWrapper'
import { pathJoin } from 'utils/misc'
import useReactRouter from 'use-react-router'
import useDataLoader from 'core/hooks/useDataLoader'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import { Typography } from '@material-ui/core'
import BlockChooser from 'core/components/BlockChooser'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2),
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    maxWidth: '800px',
  },
  workerCount: {
    margin: `${theme.spacing(4)}px 0px`,

  }
}))

const listUrl = pathJoin(k8sPrefix, 'infrastructure')
const clusterTypeDisplay = {
  local: 'BareOS',
  aws: 'AWS',
  azure: 'Azure',
}

const ScaleWorkers = ({ cluster }) => {
  const classes = useStyles()
  const { name, cloudProviderType } = cluster
  const isLocal = cloudProviderType === 'local'
  const isCloud = ['aws', 'azure'].includes(cloudProviderType)
  const type = clusterTypeDisplay[cloudProviderType]
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
          <div>
            <BlockChooser
              options={[
                {
                  id: 'add',
                  title: 'Add',
                  icon: <FontAwesomeIcon size="2x">layer-plus</FontAwesomeIcon>,
                  description: 'Add worker nodes to the cluster',
                },
                {
                  id: 'remove',
                  icon: <FontAwesomeIcon size="2x">layer-minus</FontAwesomeIcon>,
                  title: 'Remove',
                  description: 'Remove worker nodes from the cluster',
                }
              ]}
            />
          </div>
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
  const classes = useStyles()
  const { id } = useReactRouter().match.params
  const [clusters, loading] = useDataLoader(clusterActions.list)
  const cluster = (clusters || []).find(x => x.uuid === id)

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
