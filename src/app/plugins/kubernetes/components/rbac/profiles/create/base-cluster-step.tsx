import useDataLoader from 'core/hooks/useDataLoader'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import React, { useCallback } from 'react'
import WizardStep from 'core/components/wizard/WizardStep'
import ListTable from 'core/components/listTable/ListTable'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import SimpleLink from 'core/components/SimpleLink'
import Input from 'core/elements/input'
import { listTablePrefs, profilesHelpUrl } from 'app/constants'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import ProfileSummaryBox from 'k8s/components/rbac/profiles/create/profile-summary-box'
import useStyles from './useStyles'
import { isEmpty } from 'ramda'

const RbacProfileBox = ({ profileName, setWizardContext }) => {
  const classes = useStyles()
  return (
    <FormFieldCard
      title={'RBAC Profile'}
      link={<SimpleLink src={profilesHelpUrl}>Profiles Help</SimpleLink>}
    >
      <p>
        RBAC Profiles allow you to snapshot a cluster and create a 'profile' or template of the
        clusters RBAC policies and then use the profile engine to apply the profile to other
        clusters as a standard.
      </p>
      <Input
        InputLabelProps={{
          classes: {
            root: classes.label,
          },
        }}
        label={`Profile Name *`}
        value={profileName}
        onChange={(e) => {
          setWizardContext({ profileName: e.target.value })
        }}
      />
    </FormFieldCard>
  )
}
export const defaultParams = {
  masterNodeClusters: true,
}
export const usePrefParams = createUsePrefParamsHook('Clusters', listTablePrefs)
export const columns = [
  { id: 'uuid', display: false },
  { id: 'name', label: 'Name' },
  { id: 'version', label: 'Version' },
  { id: 'cloudProviderType', label: 'Cloud Provider' },
]
const visibleColumns = ['name', 'version', 'cloudProviderType']
const columnsOrder = ['name', 'version', 'cloudProviderType']
const orderBy = 'name'
const orderDirection = 'asc'
const searchTargets = ['name', 'version']

export const BaseClusterStep = ({ wizardContext, setWizardContext }) => {
  const classes = useStyles()
  const { params } = usePrefParams(defaultParams)
  const [data, loading, reload] = useDataLoader(clusterActions.list, params)
  const refetch = useCallback(() => reload(true), [reload])
  const handleSelect = useCallback((row) => {
    setWizardContext({ baseCluster: row.name })
  }, [])
  const validateFields = useCallback(
    ({ profileName, baseCluster }) => !isEmpty(profileName) && !isEmpty(baseCluster),
    [],
  )
  return (
    <WizardStep
      className={classes.splitWizardStep}
      label="Base Cluster"
      stepId="baseCluster"
      validateFields={validateFields}
    >
      <ProfileSummaryBox {...wizardContext} />
      <div className={classes.profileContents}>
        <RbacProfileBox
          profileName={wizardContext.profileName}
          setWizardContext={setWizardContext}
        />
        <br />
        <FormFieldCard className={classes.listBox} title={'Select a Base Cluster'}>
          <p>
            Choose the Base Cluster to use as a template of which you can individually select Roles,
            Cluster Roles, Role Bindings and Cluster Role Bindings. Each item can be edited after
            the Profile has been created.
          </p>
          <ListTable
            uniqueIdentifier={'uuid'}
            multiSelection={false}
            canEditColumns={false}
            searchTargets={searchTargets}
            data={data}
            onReload={refetch}
            loading={loading}
            columns={columns}
            visibleColumns={visibleColumns}
            columnsOrder={columnsOrder}
            orderBy={orderBy}
            orderDirection={orderDirection}
            onSelect={handleSelect}
          />
        </FormFieldCard>
      </div>
    </WizardStep>
  )
}
