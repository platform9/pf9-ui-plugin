import { makeStyles } from '@material-ui/styles'
import { allKey, listTablePrefs } from 'app/constants'
import ExternalLink from 'core/components/ExternalLink'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import DateCell from 'core/components/listTable/cells/DateCell'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import useListAction from 'core/hooks/useListAction'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'
import { makeStyles } from '@material-ui/styles'
import { objSwitchCase } from 'utils/fp'
import { listPods, podActions } from 'k8s/components/pods/actions'
import renderLabels from 'k8s/components/pods/renderLabels'
import { makePodsSelector } from 'k8s/components/pods/selectors'
import { pick } from 'ramda'
import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { objSwitchCase } from 'utils/fp'
import { DateAndTime } from 'core/components/listTable/cells/DateCell'
import ClusterStatusSpan from '../infrastructure/clusters/ClusterStatus'
import { routes } from 'core/utils/routes'
import { trackEvent } from 'utils/tracking'
import SimpleLink from 'core/components/SimpleLink'
import { makeStyles } from '@material-ui/styles'
import { pathStrOr } from 'utils/fp'
import Text from 'core/elements/text'
import Bugsnag from '@bugsnag/js'

const useStyles = makeStyles((theme) => ({
  containerLogs: {
    width: 'max-content',
    '& b': {
      fontWeight: 600,
      whiteSpace: 'nowrap',
    },
  },
}))

const defaultParams = {
  masterNodeClusters: true,
  clusterId: allKey,
}
const usePrefParams = createUsePrefParamsHook('Pods', listTablePrefs)

const selector = makePodsSelector()

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, updateParams, getParamsUpdater } = usePrefParams(defaultParams)

    const data = useSelector((store) => selector(store, params))
    const [loading, reload] = useListAction({ action: listPods, selector, params })

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
const openLogsWindow = (log, pod) => () => {
  Bugsnag.leaveBreadcrumb('Attempting to view pod logs', { log, pod })
  const { name, id, clusterName, clusterId } = pod
  const containerName = log.containerName
  trackEvent('View Pod Logs', { name, id, clusterName, clusterId, containerName })
  window.open(log.url, '_blank')
}

const renderName = (name, { dashboardUrl }) => {
  return (
    <span>
      {name}
      <br />
      <ExternalLink url={dashboardUrl}>dashboard</ExternalLink>
    </span>
  )
}

const renderContainers = (value, pod) => <ContainerLogs pod={pod} />

const ContainerLogs = ({ pod }) => {
  const classes = useStyles()
  const logs = pod.logs || []
  return (
    <>
      {logs.map((log) => (
        <Text key={log.containerName} variant="body2" className={classes.containerLogs}>
          <span>
            <b>{log.containerName}: </b>
            <SimpleLink onClick={openLogsWindow(log, pod)}>View Container Logs</SimpleLink>
          </span>
        </Text>
      ))}
    </>
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
    { id: 'name', label: 'Name', render: renderName },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'namespace', label: 'Namespace' },
    { id: 'labels', label: 'Labels', render: renderLabels('label') },
    { id: 'containers', label: 'Containers', render: renderContainers },
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
