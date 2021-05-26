import React, { useEffect } from 'react'
import useReactRouter from 'use-react-router'
import useDataLoader from 'core/hooks/useDataLoader'
import { importedClusterActions } from './actions'
import PageContainer from 'core/components/pageContainer/PageContainer'
import { routes } from 'core/utils/routes'
import { IUseDataLoader } from '../nodes/model'
import { ImportedClusterSelector } from './model'
import EKSClusterDetails from './eks-cluster-details'
import AKSClusterDetails from './aks-cluster-details'

function ImportedClusterDetails() {
  const { match, history } = useReactRouter()
  const [clusters, loading, reload]: IUseDataLoader<ImportedClusterSelector> = useDataLoader(
    importedClusterActions.list,
  ) as any
  const cluster = clusters.find((x) => x.uuid === match.params.id)
  useEffect(() => {
    if (!cluster) {
      history.push(routes.cluster.imported.list.path())
    }
  }, [cluster, history])

  if (!cluster) {
    return null
  }

  return (
    <PageContainer>
      {cluster.providerType === 'eks' && (
        <EKSClusterDetails cluster={cluster} reload={reload} loading={loading} />
      )}
      {cluster.providerType === 'aks' && (
        <AKSClusterDetails cluster={cluster} reload={reload} loading={loading} />
      )}
    </PageContainer>
  )
}

export default ImportedClusterDetails
