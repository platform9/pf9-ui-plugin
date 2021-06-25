import React, { useMemo, useCallback } from 'react'
import Text from 'core/elements/text'
import DocumentMeta from 'core/components/DocumentMeta'
import Wizard from 'core/components/wizard/Wizard'
import { BaseClusterStep } from 'k8s/components/rbac/profiles/create/base-cluster-step'
import RolesStep from 'k8s/components/rbac/profiles/create/roles-step'
import ClusterRolesStep from 'k8s/components/rbac/profiles/create/cluster-roles-step'
import RoleBindingsStep from 'k8s/components/rbac/profiles/create/role-bindings-step'
import ClusterRoleBindingsStep from 'k8s/components/rbac/profiles/create/cluster-role-bindings-step'
import ReviewStep from 'k8s/components/rbac/profiles/create/review-step'
import { rbacProfileActions } from 'k8s/components/rbac/actions'

const CreateRbacProfile = () => {
  const initialContext = useMemo(
    () => ({
      profileName: '',
      baseCluster: '',
      roles: {},
      clusterRoles: {},
      roleBindings: {},
      clusterRoleBindings: {},
    }),
    [],
  )
  const handleSubmit = useCallback(async (params) => {
    await rbacProfileActions.create(params)
  }, [])

  return (
    <>
      <Text variant="subtitle1">Create a new RBAC Profile</Text>
      <br />
      <DocumentMeta title="Create a New RBAC Profile" bodyClasses={['form-view']} />
      <Wizard context={initialContext} submitLabel="Deploy" onComplete={handleSubmit}>
        {({ wizardContext, setWizardContext }) => (
          <>
            <BaseClusterStep {...{ wizardContext, setWizardContext }} />
            <RolesStep {...{ wizardContext, setWizardContext }} />
            <ClusterRolesStep {...{ wizardContext, setWizardContext }} />
            <RoleBindingsStep {...{ wizardContext, setWizardContext }} />
            <ClusterRoleBindingsStep {...{ wizardContext, setWizardContext }} />
            <ReviewStep {...{ wizardContext }} />
          </>
        )}
      </Wizard>
    </>
  )
}

export default CreateRbacProfile
