import React from 'react'
import { DateAndTime } from 'core/components/listTable/cells/DateCell'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { ActionDataKeys } from '../../../DataKeys'
import { routes } from 'core/utils/routes'
import { useSelector } from 'react-redux'
import { prop } from 'ramda'
import { sessionStoreKey } from 'core/session/sessionReducers'
import { isAdmin } from '../clusters/helpers'
import DetachImportedClusterDialog from './DetachImportedClusterDialog'
import ToggleMonitoringDialog from './ToggleMonitoringDialog'
import SimpleLink from 'core/components/SimpleLink'
import { importedClusterStatusMap } from './model'
import ClusterStatusSpan from '../clusters/ClusterStatus'

const renderExternal = (_, { external }) => (external ? <div>External</div> : null)

const renderNodeGroups = (_, { nodeGroups }) => <div>{nodeGroups?.length || 0}</div>

const renderClusterDetailLink = (name, cluster) => (
  <SimpleLink src={routes.cluster.imported.details.path({ id: cluster.uuid })}>{name}</SimpleLink>
)

const renderStatus = (phase) => {
  return (
    <ClusterStatusSpan title={phase} variant="table" status={importedClusterStatusMap[phase]}>
      {phase}
    </ClusterStatusSpan>
  )
}

const columns = [
  { id: 'uuid', label: 'UUID', display: false },
  { id: 'name', label: 'Name', render: renderClusterDetailLink },
  { id: 'external', label: 'Type', render: renderExternal },
  { id: 'status.phase', label: 'Status', render: renderStatus },
  { id: 'region', label: 'Region' },
  { id: 'kubeVersion', label: 'Kubernetes Version' },
  { id: 'nodeGroups', label: 'Node Groups', render: renderNodeGroups },
  { id: 'containerCidr', label: 'Container CIDR' },
  { id: 'servicesCidr', label: 'Services CIDR' },
  { id: 'creationTimestamp', label: 'Created', render: (value) => <DateAndTime value={value} /> },
]

export const options = {
  addButtonConfigs: [
    {
      label: 'Create Cluster',
      link: routes.cluster.add.path(),
      cond: () => {
        const session = useSelector(prop(sessionStoreKey))
        const {
          userDetails: { role },
        }: any = session
        return role === 'admin'
      },
    },
    {
      label: 'Import Cluster',
      link: routes.cluster.import.root.path(),
      cond: () => {
        const session = useSelector(prop(sessionStoreKey))
        const {
          userDetails: { role },
          features,
        }: any = session
        return role === 'admin' && features.experimental.kplane
      },
    },
  ],
  columns,
  cacheKey: ActionDataKeys.ImportedClusters,
  name: 'Imported Clusters',
  title: 'Imported Clusters',
  uniqueIdentifier: 'uuid',
  multiSelection: false,
  hideDelete: true,
  batchActions: [
    // Add in when details page is in
    // {
    //   icon: 'info-circle',
    //   label: 'Details',
    //   routeTo: (rows) => `/ui/kubernetes/infrastructure/importedclusters/${rows[0].uuid}`,
    // },
    {
      cond: isAdmin,
      icon: 'chart-bar',
      label: 'Monitoring',
      dialog: ToggleMonitoringDialog,
    },
    {
      cond: isAdmin,
      icon: 'trash-alt',
      label: 'Detach',
      dialog: DetachImportedClusterDialog,
    },
  ],
}

const { ListPage } = createCRUDComponents(options)

export default ListPage
