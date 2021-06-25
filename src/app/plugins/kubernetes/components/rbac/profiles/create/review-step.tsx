import WizardStep from 'core/components/wizard/WizardStep'
import React, { useState, useCallback, useMemo } from 'react'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { except } from 'utils/fp'
import Panel from 'app/plugins/theme/components/Panel'
import { RolesListTable } from 'k8s/components/rbac/profiles/create/roles-step'
import useDataLoader from 'core/hooks/useDataLoader'
import {
  roleActions,
  roleBindingActions,
  clusterRoleActions,
  clusterRoleBindingActions,
} from 'k8s/components/rbac/actions'
import { allKey } from 'app/constants'
import { RoleBindingsListTable } from 'k8s/components/rbac/profiles/create/role-bindings-step'
import { ClusterRolesListTable } from 'k8s/components/rbac/profiles/create/cluster-roles-step'
import { ClusterRoleBindingsListTable } from 'k8s/components/rbac/profiles/create/cluster-role-bindings-step'
import useStyles from './useStyles'

const defaultParams = {
  masterNodeClusters: true,
  clusterId: allKey,
  namespace: allKey,
}

enum Panels {
  Roles,
  ClusterRoles,
  RoleBindings,
  ClusterRoleBindings,
}
const defaultActivePanels = []

const ReviewStep = ({ wizardContext }) => {
  const classes = useStyles()
  const {
    profileName,
    baseCluster,
    roles: selectedRoles,
    clusterRoles: selectedClusterRoles,
    roleBindings: selectedRoleBindings,
    clusterRoleBindings: selectedClusterRoleBindings,
  } = wizardContext
  const [activePanels, setActivePanels] = useState<Panels[]>(defaultActivePanels)
  const togglePanel = useCallback(
    (panel) => () => {
      setActivePanels(
        activePanels.includes(panel) ? except(panel, activePanels) : [panel, ...activePanels],
      )
    },
    [activePanels],
  )
  const [roles] = useDataLoader(roleActions.list, defaultParams)
  const [clusterRoles] = useDataLoader(clusterRoleActions.list, defaultParams)
  const [roleBindings] = useDataLoader(roleBindingActions.list, defaultParams)
  const [clusterRoleBindings] = useDataLoader(clusterRoleBindingActions.list, defaultParams)
  const filteredRoles = useMemo(() => roles.filter(({ id }) => !!selectedRoles[id]), [
    roles,
    selectedRoles,
  ])
  const filteredClusterRoles = useMemo(
    () => clusterRoles.filter(({ id }) => !!selectedClusterRoles[id]),
    [clusterRoles, selectedClusterRoles],
  )
  const filteredRoleBindings = useMemo(
    () => roleBindings.filter(({ id }) => !!selectedRoleBindings[id]),
    [roleBindings, selectedRoleBindings],
  )
  const filteredClusterRoleBindings = useMemo(
    () => clusterRoleBindings.filter(({ id }) => !!selectedClusterRoleBindings[id]),
    [clusterRoleBindings, selectedClusterRoleBindings],
  )

  return (
    <WizardStep label="Review" stepId="review">
      <FormFieldCard className={classes.listBox} title={'RBAC Profile - Review'}>
        The selected RBAC Policies will be added to your list of <strong>Draft Profiles</strong>.
        You can review and customize the profile after the draft is created. Once the profile is
        customized to your requirements you can publish the profile for use.
        <br />
        <br />
        <p>
          Profile Name: <strong>{profileName}</strong>
        </p>
        <p>
          Base Cluster: <strong>{baseCluster}</strong>
        </p>
        <br />
        {filteredRoles.length ? (
          <Panel
            expanded={activePanels.includes(Panels.Roles)}
            onClick={togglePanel(Panels.Roles)}
            title={`Roles ${filteredRoles.length}`}
          >
            <RolesListTable data={filteredRoles} compactTable />
          </Panel>
        ) : null}
        {filteredClusterRoles.length ? (
          <Panel
            expanded={activePanels.includes(Panels.ClusterRoles)}
            onClick={togglePanel(Panels.ClusterRoles)}
            title={`Cluster Roles ${filteredClusterRoles.length}`}
          >
            <ClusterRolesListTable data={filteredClusterRoles} compactTable />
          </Panel>
        ) : null}
        {filteredRoleBindings.length ? (
          <Panel
            expanded={activePanels.includes(Panels.RoleBindings)}
            onClick={togglePanel(Panels.RoleBindings)}
            title={`Role Bindings ${filteredRoleBindings.length}`}
          >
            <RoleBindingsListTable data={filteredRoleBindings} compactTable />
          </Panel>
        ) : null}
        {filteredClusterRoleBindings.length ? (
          <Panel
            expanded={activePanels.includes(Panels.ClusterRoleBindings)}
            onClick={togglePanel(Panels.ClusterRoleBindings)}
            title={`Cluster Role Bindings ${filteredClusterRoleBindings.length}`}
          >
            <ClusterRoleBindingsListTable data={filteredClusterRoleBindings} compactTable />
          </Panel>
        ) : null}
      </FormFieldCard>
    </WizardStep>
  )
}

export default ReviewStep
