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
import { ErrorMessage } from 'core/components/validatedForm/ErrorMessage'
import useDataUpdater from 'core/hooks/useDataUpdater'
import useDataLoader from 'core/hooks/useDataLoader'
// import { propEq } from 'ramda'
import useStyles from 'k8s/components/rbac/profiles/create/useStyles'
// import ProfileSummaryBox from 'k8s/components/rbac/profiles/create/profile-summary-box'

const EditRbacProfile = () => {
  const classes = useStyles()
  const { history } = useReactRouter()
  // const { profileId } = match.params

  const [, loadingProfiles] = useDataLoader(rbacProfileActions.list)
  // const profile = useMemo(() => profiles.find(propEq('uid', profileId)) || {}, [profileId])
  const [updateRbacProfile, updatingRbacProfile] = useDataUpdater(rbacProfileActions.create)
  const [errorMessage, setErrorMessage] = useState<string>('')
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
    const [success] = await updateRbacProfile(params)

    if (success) {
      history.push(routes.rbac.profiles.list.path())
    } else {
      setErrorMessage('ERROR: Error saving profile')
    }
  }, [])

  return (
    <FormWrapper
      title={'Edit RBAC Profile'}
      backUrl={routes.rbac.profiles.list.path()}
      message={updatingRbacProfile ? 'Submitting form...' : 'Loading Profile...'}
      loading={loadingProfiles || updatingRbacProfile}
    >
      <DocumentMeta title="Edit RBAC Profile" bodyClasses={['form-view']} />
      <div className={classes.splitWizardStep}>
        {/*<ProfileSummaryBox {...wizardContext} />*/}
        <Wizard context={initialContext} submitLabel="Save" onComplete={handleSubmit}>
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
      </div>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </FormWrapper>
  )
}

export default EditRbacProfile
