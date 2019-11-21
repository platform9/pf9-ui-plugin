import React from 'react'
import { k8sPrefix } from 'app/constants'
import { makeStyles } from '@material-ui/styles'
import FormWrapper from 'core/components/FormWrapper'
import { pathJoin } from 'utils/misc'
import useReactRouter from 'use-react-router'
import useDataLoader from 'core/hooks/useDataLoader'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import { Button } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2),
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    maxWidth: '800px',
  },
}))

const listUrl = pathJoin(k8sPrefix, 'infrastructure')

const ScaleMasters = ({ cluster }) => {
  const isLocal = cluster.cloudProviderType === 'local'
  const isCloud = ['aws', 'azure'].includes(cluster.cloudProviderType)
  return (
    <div>
      {isCloud &&
        <div>
          What type of nodes are you looking to scale?
          <Button color="primary" variant="contained">Scale masters</Button>
          <Button color="primary" variant="contained">Scale workers</Button>
        </div>
      }
      {isLocal &&
        <div>
          What type of nodes are you looking to scale?
          <Button color="primary" variant="contained">Scale masters</Button>
          <Button color="primary" variant="contained">Scale workers</Button>
        </div>
      }
    </div>
  )
}

const ScaleMastersPage = () => {
  const classes = useStyles()
  const { id } = useReactRouter().match.params
  const [clusters, loading] = useDataLoader(clusterActions.list)
  const cluster = (clusters || []).find(x => x.uuid === id)

  return (
    <FormWrapper
      className={classes.root}
      title="Scale Cluster"
      backUrl={listUrl}
      loading={loading}
      renderContentOnMount={false}
      message="Loading cluster..."
    >
      <ScaleMasters cluster={cluster} />
    </FormWrapper>
  )
}

export default ScaleMastersPage
