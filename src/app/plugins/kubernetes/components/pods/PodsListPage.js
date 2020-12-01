import React, { useCallback } from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { podActions } from 'k8s/components/pods/actions'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs, allKey } from 'app/constants'
import { pick } from 'ramda'
import ExternalLink from 'core/components/ExternalLink'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'
import renderLabels from 'k8s/components/pods/renderLabels'
import { DateAndTime } from 'core/components/listTable/cells/DateCell'
import ClusterStatusSpan from '../infrastructure/clusters/ClusterStatus'
import { routes } from 'core/utils/routes'
import { trackEvent } from 'utils/tracking'
import SimpleLink from 'core/components/SimpleLink'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles((theme) => ({
  links: {
    display: 'grid',
    width: 'max-content',
  },
}))

const defaultParams = {
  masterNodeClusters: true,
  clusterId: allKey,
}
const usePrefParams = createUsePrefParamsHook('Pods', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, updateParams, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(podActions.list, params)
    const updateClusterId = useCallback((clusterId) => {
      updateParams({
        clusterId,
        namespace: allKey,
      })
    }, [])
    return (
      <ListContainer
        loading={loading}
        reload={reload}
        data={data}
        getParamsUpdater={getParamsUpdater}
        filters={
          <>
            <ClusterPicklist
              selectFirst={false}
              onChange={updateClusterId}
              value={params.clusterId}
              onlyMasterNodeClusters
            />
            <NamespacePicklist
              selectFirst={false}
              onChange={getParamsUpdater('namespace')}
              value={params.namespace}
              clusterId={params.clusterId}
              disabled={!params.clusterId}
            />
          </>
        }
        {...pick(listTablePrefs, params)}
      />
    )
  }
}
const openLogsWindow = ({ name, id, clusterName, clusterId, logs }) => () => {
  trackEvent('View Pod Logs', { name, id, clusterName, clusterId })
  window.open(logs)
}

const renderLinks = (links, pod) => {
  return <PodLinks pod={pod} />
}

const PodLinks = ({ pod }) => {
  const classes = useStyles()
  return (
    <div className={classes.links}>
      <ExternalLink url={pod.dashboardUrl}>dashboard</ExternalLink>
      {pod.logs && (
        <SimpleLink
          src={pod.logs || ''}
          target="_blank"
          rel="noopener"
          onClick={openLogsWindow(pod)}
        >
          View Container Logs
        </SimpleLink>
      )}
    </div>
  )
}

const renderStatus = (phase) => {
  let status = 'pending'
  switch (phase) {
    case 'Running':
    case 'Succeeded':
      status = 'ok'
      break

    case 'Failed':
      status = 'fail'
      break
  }
  return <ClusterStatusSpan status={status}>{phase}</ClusterStatusSpan>
}

export const options = {
  deleteFn: podActions.delete,
  addUrl: routes.pods.add.path(),
  addText: 'Create New Pod',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'namespace', label: 'Namespace' },
    { id: 'labels', label: 'Labels', render: renderLabels('label') },
    { id: 'links', label: 'Links', render: renderLinks },
    { id: 'status.phase', label: 'Status', render: renderStatus },
    { id: 'status.hostIP', label: 'Node IP' },
    {
      id: 'created',
      label: 'Age',
      render: (value) => <DateAndTime value={value} />,
    },
  ],
  name: 'Pods',
  title: 'Pods',
  ListPage,
}
const components = createCRUDComponents(options)
export const PodsList = components.List

export default components.ListPage
