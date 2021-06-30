import useDataLoader from 'core/hooks/useDataLoader'
import { roleActions } from 'k8s/components/rbac/actions'
import React, { useCallback, useState, useMemo } from 'react'
import WizardStep from 'core/components/wizard/WizardStep'
import ListTable from 'core/components/listTable/ListTable'
import ProfileSummaryBox from 'k8s/components/rbac/profiles/create/profile-summary-box'
import { allKey, profilesHelpUrl } from 'app/constants'
import useParams from 'core/hooks/useParams'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'
import DateCell from 'core/components/listTable/cells/DateCell'
import SimpleLink from 'core/components/SimpleLink'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { emptyArr } from 'utils/fp'
import useStyles from './useStyles'
import ExpandIcon from 'k8s/components/rbac/profiles/create/expand-icon'
import ApiPermissionsDialog, {
  ApiPermissionsParams,
} from 'k8s/components/rbac/profiles/create/api-permissions-dialog'
import useToggler from 'core/hooks/useToggler'

const defaultParams = {
  masterNodeClusters: true,
  clusterId: allKey,
  namespace: allKey,
}
const visibleColumns = ['name', 'namespace', 'created', 'apiAccess']
const columnsOrder = ['name', 'namespace', 'created', 'apiAccess']
const orderBy = 'name'
const orderDirection = 'asc'
const searchTargets = ['name', 'namespace']

export const RolesListTable = ({
  data,
  onReload = null,
  loading = null,
  onSelectedRowsChange = null,
  selectedRows = emptyArr,
  filters = null,
  ...rest
}) => {
  const [currentApiPermissions, setCurrentApiPermissions] = useState<ApiPermissionsParams>()
  const [showingPermissionsDialog, togglePermissionsDialog] = useToggler()
  const showApiPermissions = useCallback((row) => {
    setCurrentApiPermissions({
      name: row.name,
      cluster: row.clusterName,
      namespace: row.namespace,
      rules: row.rules,
    })
    togglePermissionsDialog()
  }, [])
  const columns = useMemo(
    () => [
      { id: 'id', display: false },
      { id: 'name', label: 'Name' },
      { id: 'namespace', label: 'Namespace' },
      { id: 'created', label: 'Created', render: (value) => <DateCell value={value} /> },
      {
        id: 'apiAccess',
        render: (value, row) => (
          <ExpandIcon
            onClick={(e) => {
              e.stopPropagation()
              showApiPermissions(row)
            }}
          />
        ),
      },
    ],
    [],
  )

  return (
    <>
      <ApiPermissionsDialog
        onClose={togglePermissionsDialog}
        open={showingPermissionsDialog}
        name={currentApiPermissions?.name}
        cluster={currentApiPermissions?.cluster}
        namespace={currentApiPermissions?.namespace}
        rules={currentApiPermissions?.rules}
      />
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
    </>
  )
}

const RolesStep = ({ wizardContext, setWizardContext }) => {
  const classes = useStyles()
  const [selectedRows, setSelectedRows] = useState(emptyArr)
  const { params, getParamsUpdater } = useParams(defaultParams)
  const [data, loading, reload] = useDataLoader(roleActions.list, params)
  const refetch = useCallback(() => reload(true), [reload])
  const handleSelect = useCallback((rows) => {
    setSelectedRows(rows)
    setWizardContext({
      roles: rows.reduce((acc, { id, ...rest }) => {
        acc[id] = rest
        return acc
      }, {}),
    })
  }, [])

  return (
    <WizardStep className={classes.splitWizardStep} label="Roles" stepId="roles">
      <ProfileSummaryBox {...wizardContext} />

      <FormFieldCard
        className={classes.listBox}
        title={'RBAC Profile - Roles'}
        link={<SimpleLink src={profilesHelpUrl}>Profiles Help</SimpleLink>}
      >
        <RolesListTable
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
          onSelectedRowsChange={handleSelect}
          selectedRows={selectedRows}
        />
      </FormFieldCard>
    </WizardStep>
  )
}

export default RolesStep
