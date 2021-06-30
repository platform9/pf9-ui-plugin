import WizardStep from 'core/components/wizard/WizardStep'
import React, { useCallback, useState, useMemo } from 'react'
import ProfileSummaryBox from 'k8s/components/rbac/profiles/create/profile-summary-box'
import ListTable from 'core/components/listTable/ListTable'
import useParams from 'core/hooks/useParams'
import useDataLoader from 'core/hooks/useDataLoader'
import { clusterRoleBindingActions } from 'k8s/components/rbac/actions'
import { allKey, profilesHelpUrl } from 'app/constants'
import DateCell from 'core/components/listTable/cells/DateCell'
import SimpleLink from 'core/components/SimpleLink'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { emptyArr } from 'utils/fp'
import { isEmpty } from 'ramda'
import useStyles from './useStyles'

const defaultParams = {
  masterNodeClusters: true,
  clusterId: allKey,
}
const visibleColumns = ['name', 'clusterName', 'created']
const columnsOrder = ['name', 'clusterName', 'created']
const orderBy = 'name'
const orderDirection = 'asc'
const searchTargets = ['name', 'clusterName']

export const ClusterRoleBindingsListTable = ({
  data,
  onReload = null,
  loading = null,
  onSelectedRowsChange = null,
  selectedRows = emptyArr,
  ...rest
}) => {
  const columns = useMemo(
    () => [
      { id: 'id', display: false },
      { id: 'name', label: 'Name' },
      { id: 'clusterName', label: 'Cluster' },
      { id: 'created', label: 'Created', render: (value) => <DateCell value={value} /> },
    ],
    [],
  )

  return (
    <ListTable
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

const ClusterRoleBindingsStep = ({ wizardContext, setWizardContext }) => {
  const classes = useStyles()
  const [selectedRows, setSelectedRows] = useState(emptyArr)
  const { params } = useParams(defaultParams)
  const [data, loading, reload] = useDataLoader(clusterRoleBindingActions.list, params)
  const refetch = useCallback(() => reload(true), [reload])
  const handleSelect = useCallback((rows) => {
    setSelectedRows(rows)
    setWizardContext({
      clusterRoleBindings: rows.reduce((acc, { id, ...rest }) => {
        acc[id] = rest
        return acc
      }, {}),
    })
  }, [])
  const validateFields = useCallback(
    ({ roles, clusterRoles, roleBindings, clusterRoleBindings }) =>
      !isEmpty(roles) ||
      !isEmpty(clusterRoles) ||
      !isEmpty(roleBindings) ||
      !isEmpty(clusterRoleBindings),
    [],
  )

  return (
    <WizardStep
      className={classes.splitWizardStep}
      label="Cluster Role Bindings"
      stepId="clusterRoleBindings"
      validateFields={validateFields}
    >
      <ProfileSummaryBox {...wizardContext} />
      <FormFieldCard
        className={classes.listBox}
        title={'RBAC Profile - Cluster Role Bindings'}
        link={<SimpleLink src={profilesHelpUrl}>Profiles Help</SimpleLink>}
      >
        <ClusterRoleBindingsListTable
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

export default ClusterRoleBindingsStep
