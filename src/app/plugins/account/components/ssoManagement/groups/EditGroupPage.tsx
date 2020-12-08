import React, { useEffect, useMemo, useState } from 'react'
import useReactRouter from 'use-react-router'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import { routes } from 'core/utils/routes'
import FormWrapperDefault from 'core/components/FormWrapper'
import DocumentMeta from 'core/components/DocumentMeta'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import TenantRolesTableFieldDefault from '../../userManagement/users/TenantRolesTableField'
import { requiredValidator } from 'core/utils/fieldValidators'
import { mngmTenantActions } from '../../userManagement/tenants/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import Progress from 'core/components/progress/Progress'
import {
  groupFormSubmission,
  loadGroupRoleAssignments,
  mngmGroupActions,
  mngmGroupMappingActions,
} from './actions'
import GroupSettingsFields from './GroupSettingsFields'
import GroupCustomMappingsFields from './GroupCustomMappingsFields'
import { propEq } from 'ramda'
import { emptyObj, pathStr } from 'utils/fp'
import uuid from 'uuid'
import { Criteria } from './CriteriaPicklist'
import GroupsTips from './GroupsTips'
const FormWrapper: any = FormWrapperDefault // types on forward ref .js file dont work well.
const TenantRolesTableField: any = TenantRolesTableFieldDefault // types on forward ref .js file dont work well.

const useStyles = makeStyles((theme: Theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
}))

const tenantRolesValidations = [requiredValidator.withMessage('Must select at least one tenant')]

const getMappingCriteria = (mapping) =>
  [Criteria.Contains, Criteria.DoesNotContain].find((type) => mapping.hasOwnProperty(type)) || ''

const EditGroupPage = () => {
  const { match, history } = useReactRouter()
  const classes = useStyles({})
  const groupId = match.params.id
  const [tenants, loadingTenants] = useDataLoader(mngmTenantActions.list)
  const [groups, loadingGroups] = useDataLoader(mngmGroupActions.list)
  const group = useMemo(() => groups.find(propEq('id', groupId)) || emptyObj, [groups, groupId])
  const [groupMappings, loadingGroupMappings] = useDataLoader(mngmGroupMappingActions.list)
  const [roleAssignments, setRoleAssignments] = useState(null)
  const mappingRule = useMemo(() => {
    if (groupMappings) {
      return groupMappings[0].rules.find((rule) => groupId === rule.local[0].group.id)
    }
    return null
  }, [groupMappings])
  const [submitting, updateSubmitting] = useState(false)
  const existingMapping = groupMappings[0]
  // const [roleAssignments, loadingRoleAssignments] = useDataLoader(
  //   mngmGroupRoleAssignmentsLoader,
  //   {
  //     groupId,
  //   },
  //   { loadOnDemand: true },
  // )

  const initialContext = useMemo(
    () => ({
      groupId: groupId,
      name: group.name,
      description: group.description,
      firstNameKey: mappingRule?.remote[0].type,
      lastNameKey: mappingRule?.remote[1].type,
      emailKey: mappingRule?.remote[2].type,
      customMappings:
        mappingRule?.remote.slice(3).map((mapping) => ({
          id: uuid.v4(),
          attribute: mapping.type,
          criteria: getMappingCriteria(mapping),
          values: mapping[getMappingCriteria(mapping)]?.join(', ') || '',
          regexMatching: mapping.regex,
        })) || [],
      roleAssignments: roleAssignments?.reduce(
        (acc, roleAssignment) => ({
          ...acc,
          [pathStr('scope.project.id', roleAssignment)]: pathStr('role.id', roleAssignment),
        }),
        {},
      ),
      prevRoleAssignmentsArr: roleAssignments,
    }),
    [group, mappingRule, roleAssignments],
  )

  useEffect(() => {
    const loadRoles = async () => {
      const roles = await loadGroupRoleAssignments(groupId)
      setRoleAssignments(roles)
    }

    loadRoles()
  }, [groupId])

  const loadingSomething =
    loadingGroups ||
    loadingGroupMappings ||
    // loadingRoleAssignments ||
    !roleAssignments

  const finishedInitialLoad = !(
    loadingGroups ||
    loadingGroupMappings ||
    // loadingRoleAssignments ||
    !roleAssignments
  )

  const submitForm = async (params) => {
    updateSubmitting(true)
    const success = await groupFormSubmission({ params, existingMapping, operation: 'update' })
    if (!success) {
      updateSubmitting(false)
      return
    }
    history.push(routes.sso.groups.path())
  }

  return (
    <>
      <DocumentMeta title="Edit Group" bodyClasses={['form-view']} />
      <FormWrapper
        title="Edit Group"
        backUrl={routes.sso.groups.path()}
        loading={!finishedInitialLoad || submitting}
        message={submitting ? 'Submitting form...' : 'Loading Group...'}
      >
        {/* initialContext needs to be loaded fully for tenant roles table */}
        {finishedInitialLoad && (
          <Wizard
            onComplete={submitForm}
            context={initialContext}
            hideBack={true}
            finishAndReviewLabel="Done"
            loading={loadingSomething}
          >
            {({ wizardContext, setWizardContext, onNext }) => {
              return (
                <>
                  <WizardStep stepId="step1" label="Edit Group" keepContentMounted={false}>
                    <ValidatedForm
                      classes={{ root: classes.validatedFormContainer }}
                      initialValues={wizardContext}
                      onSubmit={setWizardContext}
                      triggerSubmit={onNext}
                      title="Edit Group"
                      elevated={false}
                    >
                      <GroupsTips />
                      <FormFieldCard title="Group Settings">
                        <GroupSettingsFields
                          wizardContext={wizardContext}
                          setWizardContext={setWizardContext}
                        />
                        <GroupCustomMappingsFields
                          wizardContext={wizardContext}
                          setWizardContext={setWizardContext}
                        />
                      </FormFieldCard>
                      <FormFieldCard title="Tenants & Roles">
                        <Text variant="body2">
                          Specify what Tenants this Group should have access to, and what role the
                          users will be assigned in each Tenant.
                        </Text>
                        <Progress
                          renderContentOnMount={!loadingTenants}
                          loading={loadingTenants}
                          message={'Loading Tenants...'}
                        >
                          <TenantRolesTableField
                            validations={tenantRolesValidations}
                            id="roleAssignments"
                            tenants={tenants}
                          />
                        </Progress>
                      </FormFieldCard>
                    </ValidatedForm>
                  </WizardStep>
                </>
              )
            }}
          </Wizard>
        )}
      </FormWrapper>
    </>
  )
}

export default EditGroupPage
