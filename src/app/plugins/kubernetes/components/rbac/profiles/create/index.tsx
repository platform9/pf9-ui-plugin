import React, { useMemo, useCallback, useState } from 'react'
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
import useDataUpdater from 'core/hooks/useDataUpdater'
import { ErrorMessage } from 'core/components/validatedForm/ErrorMessage'

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
  const [errorMessage, setErrorMessage] = useState<string>('')
  const { history } = useReactRouter()
  const [createRbacProfile, creatingRbacProfile] = useDataUpdater(rbacProfileActions.create)

  const handleSubmit = useCallback(async (params) => {
    const [success] = await createRbacProfile(params)

    if (success) {
      history.push(routes.rbac.profiles.list.path())
    } else {
      setErrorMessage('ERROR: Cannot edit deployed app')
    }
  }, [])

  return (
    <FormWrapper
      title={'Create a new RBAC Profile'}
      backUrl={routes.rbac.profiles.list.path()}
      message={creatingRbacProfile ? 'Saving' : ''}
      loading={creatingRbacProfile}
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
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </FormWrapper>
  )
}

export default CreateRbacProfile
