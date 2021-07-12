import WizardStep from 'core/components/wizard/WizardStep'
import React, { useCallback, useState, useMemo } from 'react'
import ProfileSummaryBox from 'k8s/components/rbac/profiles/create/profile-summary-box'
import ListTable from 'core/components/listTable/ListTable'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'
import useParams from 'core/hooks/useParams'
import useDataLoader from 'core/hooks/useDataLoader'
import { roleBindingActions } from 'k8s/components/rbac/actions'
import { allKey, profilesHelpUrl } from 'app/constants'
import DateCell from 'core/components/listTable/cells/DateCell'
import SimpleLink from 'core/components/SimpleLink'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { emptyArr } from 'utils/fp'
import useStyles from './useStyles'

const defaultParams = {
  masterNodeClusters: true,
  clusterId: allKey,
  namespace: allKey,
}
const visibleColumns = ['name', 'namespace', 'created']
const columnsOrder = ['name', 'namespace', 'created']
const orderBy = 'name'
const orderDirection = 'asc'
const searchTargets = ['name', 'namespace']

export const RoleBindingsListTable = ({
  data,
  onReload = null,
  loading = null,
  onSelectedRowsChange = null,
  selectedRows = emptyArr,
  filters = null,
  ...rest
}) => {
  const columns = useMemo(
    () => [
      { id: 'id', display: false },
      { id: 'name', label: 'Name' },
      { id: 'namespace', label: 'Namespace' },
      { id: 'created', label: 'Created', render: (value) => <DateCell value={value} /> },
    ],
    [],
  )

  return (
    <ListTable
      filters={filters}
      uniqueIdentifier={'id'}
      canEditColumns={false}
      searchTargets={searchTargets}
      data={data}
      onReload={onReload}
      loading={loading}
      columns={columns}
      visibleColumns={visibleColumns}
      columnsOrder={columnsOrder}
      orderBy={orderBy}
      orderDirection={orderDirection}
      onSelectedRowsChange={onSelectedRowsChange}
      showCheckboxes={!!onSelectedRowsChange}
      selectedRows={selectedRows}
      {...rest}
    />
  )
}

const RoleBindingsStep = ({ wizardContext, setWizardContext }) => {
  const classes = useStyles()
  const [selectedRows, setSelectedRows] = useState(emptyArr)
  const { params, getParamsUpdater } = useParams(defaultParams)
  const [data, loading, reload] = useDataLoader(roleBindingActions.list, {
    ...params,
    clusterId: wizardContext.baseCluster,
  })
  const refetch = useCallback(() => reload(true), [reload])
  const handleSelect = useCallback((rows) => {
    setSelectedRows(rows)
    setWizardContext({
      roleBindings: rows.reduce((acc, { id, ...rest }) => {
        acc[id] = rest
        return acc
      }, {}),
    })
  }, [])

  return (
    <WizardStep className={classes.splitWizardStep} label="Role Bindings" stepId="roleBindings">
      <ProfileSummaryBox {...wizardContext} />
      <FormFieldCard
        className={classes.listBox}
        title={'RBAC Profile - Role Bindings'}
        link={<SimpleLink src={profilesHelpUrl}>Profiles Help</SimpleLink>}
      >
        <RoleBindingsListTable
          filters={
            <NamespacePicklist
              /*
              // @ts-ignore */
              value={params.namespace}
              clusterId={params.clusterId}
              disabled={!params.clusterId}
              onChange={getParamsUpdater('namespace')}
            />
          }
          data={data}
          onReload={refetch}
          loading={loading}
          columnsOrder={columnsOrder}
          onSelectedRowsChange={handleSelect}
          selectedRows={selectedRows}
        />
      </FormFieldCard>
    </WizardStep>
  )
}

export default RoleBindingsStep
