import React, { useState } from 'react'
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
import { mngmGroupActions, mngmGroupMappingActions } from './actions'
import useDataUpdater from 'core/hooks/useDataUpdater'
import GroupSettingsFields from './GroupSettingsFields'
import GroupCustomMappingsFields from './GroupCustomMappingsFields'
import { formMappingRule } from './helpers'
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

const initialContext = { customMappings: [], roleAssignments: {} }

const AddGroupPage = () => {
  const { history } = useReactRouter()
  const classes = useStyles({})
  const [tenants, loadingTenants] = useDataLoader(mngmTenantActions.list)
  const [groupMappings, loadingGroupMappings] = useDataLoader(mngmGroupMappingActions.list)
  const [handleAddGroup, addingGroup] = useDataUpdater(mngmGroupActions.create)
  const [addGroupMapping, addingGroupMapping] = useDataUpdater(mngmGroupMappingActions.create)
  const [updateGroupMapping, updatingGroupMapping] = useDataUpdater(mngmGroupMappingActions.update)
  const [submitting, updateSubmitting] = useState(false)
  const existingMapping = groupMappings[0]

  const loadingSomething =
    loadingGroupMappings || addingGroup || addingGroupMapping || updatingGroupMapping

  const submitForm = async (params) => {
    updateSubmitting(true)

    // Create the group and get the group id
    const groupBody = {
      name: params.name,
      description: params.description,
    }
    const [success, group] = await handleAddGroup({
      roleAssignments: params.roleAssignments,
      ...groupBody,
    })

    // Better way to handle this failure?
    if (!success) {
      console.log('group creation failed')
      updateSubmitting(false)
      return
    }
    const groupId = group.id

    // Add group to the mapping
    const ruleBody = formMappingRule(params, groupId)
    const mappingBody = existingMapping
      ? {
          rules: [...existingMapping.rules, ruleBody],
        }
      : {
          rules: [ruleBody],
        }
    const [updateMappingSuccess] = existingMapping
      ? await updateGroupMapping({ id: existingMapping.id, ...mappingBody })
      : await addGroupMapping(mappingBody)

    // Better way to handle this failure?
    if (!updateMappingSuccess) {
      console.log('mapping was not added appropriately')
    }
    history.push(routes.sso.groups.path())
  }

  return (
    <>
      <DocumentMeta title="Add Group" bodyClasses={['form-view']} />
      <FormWrapper title="Add New Group" backUrl={routes.sso.groups.path()}>
        <Wizard
          onComplete={submitForm}
          context={initialContext}
          hideBack={true}
          finishAndReviewLabel="Done"
          loading={loadingSomething || submitting}
          message={submitting ? 'Submitting form...' : 'Loading...'}
        >
          {({ wizardContext, setWizardContext, onNext }) => {
            return (
              <>
                <WizardStep stepId="step1" label="Add Group" keepContentMounted={false}>
                  <ValidatedForm
                    classes={{ root: classes.validatedFormContainer }}
                    initialValues={wizardContext}
                    onSubmit={setWizardContext}
                    triggerSubmit={onNext}
                    title="Add Group"
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
      </FormWrapper>
    </>
  )
}

export default AddGroupPage
