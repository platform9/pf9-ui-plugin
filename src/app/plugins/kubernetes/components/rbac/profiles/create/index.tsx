import React, { useMemo, useCallback } from 'react'
import DocumentMeta from 'core/components/DocumentMeta'
import Wizard from 'core/components/wizard/Wizard'
import { BaseClusterStep } from 'k8s/components/rbac/profiles/create/base-cluster-step'
import RolesStep from 'k8s/components/rbac/profiles/create/roles-step'
import ClusterRolesStep from 'k8s/components/rbac/profiles/create/cluster-roles-step'
import RoleBindingsStep from 'k8s/components/rbac/profiles/create/role-bindings-step'
import ClusterRoleBindingsStep from 'k8s/components/rbac/profiles/create/cluster-role-bindings-step'
import ReviewStep from 'k8s/components/rbac/profiles/create/review-step'
import { rbacProfileActions } from '../actions'
import useReactRouter from 'use-react-router'
import { routes } from 'core/utils/routes'
import FormWrapper from 'core/components/FormWrapper'

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
  const { history } = useReactRouter()
  const handleSubmit = useCallback(async (params) => {
    await rbacProfileActions.create(params)
    history.push(routes.rbac.profiles.list.path())
  }, [])

  return (
    <FormWrapper
      title={'Create a new RBAC Profile'}
      backUrl={routes.rbac.profiles.list.path()}
      loading={false}
    >
      <DocumentMeta title="Create a New RBAC Profile" bodyClasses={['form-view']} />
      <Wizard context={initialContext} submitLabel="Done" onComplete={handleSubmit}>
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
    </FormWrapper>
  )
}

export default CreateRbacProfile
