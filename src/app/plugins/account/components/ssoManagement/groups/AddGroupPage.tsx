import React, { useEffect, useState } from 'react'
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
import { groupFormSubmission, loadIdpProtocols, mngmGroupMappingActions } from './actions'
import GroupSettingsFields from './GroupSettingsFields'
import GroupCustomMappingsFields from './GroupCustomMappingsFields'
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
  const [submitting, updateSubmitting] = useState(false)
  const [protocolExists, setProtocolExists] = useState(false)
  const existingMapping = groupMappings[0]

  const submitForm = async (params) => {
    updateSubmitting(true)
    const success = await groupFormSubmission({
      params,
      existingMapping,
      operation: 'create',
      protocolExists,
    })
    if (!success) {
      updateSubmitting(false)
      return
    }
    history.push(routes.sso.groups.path())
  }

  // Check for existence of saml2 protocol
  useEffect(() => {
    const checkForProtocol = async () => {
      const protocols = await loadIdpProtocols()
      setProtocolExists(!!protocols.find((p) => p.id === 'saml2' && p.idp_id === 'IDP1'))
    }
    checkForProtocol()
  }, [])

  return (
    <>
      <DocumentMeta title="Add Group" bodyClasses={['form-view']} />
      <FormWrapper title="Add New Group" backUrl={routes.sso.groups.path()}>
        <Wizard
          onComplete={submitForm}
          context={initialContext}
          hideBack={true}
          finishAndReviewLabel="Done"
          loading={loadingGroupMappings || submitting}
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
