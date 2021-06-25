import WizardStep from 'core/components/wizard/WizardStep'
import React, { useCallback, useState } from 'react'
import ProfileSummaryBox from 'k8s/components/rbac/profiles/create/profile-summary-box'
import ListTable from 'core/components/listTable/ListTable'
import useParams from 'core/hooks/useParams'
import useDataLoader from 'core/hooks/useDataLoader'
import { clusterRoleActions } from 'k8s/components/rbac/actions'
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
const columns = [
  { id: 'id', display: false },
  { id: 'name', label: 'Name' },
  { id: 'created', label: 'Created', render: (value) => <DateCell value={value} /> },
]
const visibleColumns = ['name', 'created']
const columnsOrder = ['name', 'created']
const orderBy = 'name'
const orderDirection = 'asc'
export const ClusterRolesListTable = ({
  data,
  onReload = null,
  loading = null,
  onSelectedRowsChange = null,
  selectedRows = emptyArr,
  ...rest
}) => {
  return (
    <ListTable
      uniqueIdentifier={'id'}
      canEditColumns={false}
      showPagination={false}
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

const ClusterRolesStep = ({ wizardContext, setWizardContext }) => {
  const classes = useStyles()
  const [selectedRows, setSelectedRows] = useState(emptyArr)
  const { params } = useParams(defaultParams)
  const [data, loading, reload] = useDataLoader(clusterRoleActions.list, params)
  const refetch = useCallback(() => reload(true), [reload])
  const handleSelect = useCallback((rows) => {
    setSelectedRows(rows)
    setWizardContext({
      clusterRoles: rows.reduce((acc, { id, ...rest }) => {
        acc[id] = rest
        return acc
      }, {}),
    })
  }, [])

  return (
    <WizardStep className={classes.splitWizardStep} label="Cluster Roles" stepId="clusterRoles">
      <ProfileSummaryBox {...wizardContext} />
      <FormFieldCard
        className={classes.listBox}
        title={'RBAC Profile - Cluster Roles'}
        link={<SimpleLink src={profilesHelpUrl}>Profiles Help</SimpleLink>}
      >
        <ClusterRolesListTable
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

export default ClusterRolesStep
