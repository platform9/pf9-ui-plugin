import React from 'react'
import useReactRouter from 'use-react-router'
import BannerButton from 'core/components/buttons/BannerButton'
import { makeStyles, Theme } from '@material-ui/core'
import BannerContainer from 'core/components/notifications/BannerContainer'
import BannerContent from 'core/components/notifications/BannerContent'
import useDataLoader from 'core/hooks/useDataLoader'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import { routes } from 'core/utils/routes'

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    fontWeight: 'bold',
  },
}))

const ClusterUpgradeBanner = () => {
  const classes = useStyles({})
  const { history } = useReactRouter()

  const [clusters, clustersLoading] = useDataLoader(clusterActions.list)
  const upgradableClusters = clusters.filter(cluster => cluster.canUpgrade)

  const redirectToClusters = () => {
    history.push(routes.cluster.list.path())
  }

  return (!clustersLoading && upgradableClusters.length) ? (
    <>
      <BannerContainer />
      <BannerContent>
        <div className={classes.root}>
          There's a new Platform9 release available. {upgradableClusters.length} clusters to upgrade.
          <BannerButton onClick={redirectToClusters}>View Clusters</BannerButton>
        </div>
      </BannerContent>
    </>
  ) : null
}

export default ClusterUpgradeBanner
