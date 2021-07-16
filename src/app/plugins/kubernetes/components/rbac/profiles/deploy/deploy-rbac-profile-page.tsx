import React, { useCallback, useMemo, useState } from 'react'
import FormWrapper from 'core/components/FormWrapper'
import useDataLoader from 'core/hooks/useDataLoader'
import { routes } from 'core/utils/routes'
import useReactRouter from 'use-react-router'
import { rbacProfileBindingsActions, rbacProfileActions } from '../actions'
import { propEq } from 'ramda'
import DocumentMeta from 'core/components/DocumentMeta'
import Wizard from 'core/components/wizard/Wizard'
import WizardMeta from 'core/components/wizard/WizardMeta'
import WizardStep from 'core/components/wizard/WizardStep'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import Text from 'core/elements/text'
import clsx from 'clsx'
import useDataUpdater from 'core/hooks/useDataUpdater'
import SelectClusterStep from './select-cluster-step'
import DriftAnalysis from '../drift/drift-analysis'
import SubmitButton from 'core/components/buttons/SubmitButton'
import SkipDryRunDialog from './skip-dry-run-dialog'

const useStyles = makeStyles((theme: Theme) => ({
  wizardMeta: {
    gridTemplateColumns: '372px minmax(800px, max-content) minmax(200px, max-content)',
    '& aside': {
      display: 'block',
    },
  },
  wizardMetaContainer: {
    background: theme.palette.grey['000'],
    display: 'grid',
    gridGap: theme.spacing(0.5),
    padding: theme.spacing(3),
  },
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
  calloutField: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  largeTopMargin: {
    marginTop: theme.spacing(2),
  },
  roleCounts: {
    display: 'grid',
    gridGap: theme.spacing(1),
  },
  error: {
    width: 300,
    color: theme.palette.red[500],
  },
}))

const profileCalloutFields = [
  'name',
  'roles',
  'roleBindings',
  'clusterRoles',
  'clusterRoleBindings',
]

const renderProfileCalloutFields = (cluster) => (fields) => {
  const classes = useStyles({})
  return (
    <div className={classes.wizardMetaContainer}>
      <Text variant="caption1">PROFILE SUMMARY</Text>
      <div className={clsx(classes.calloutField, classes.largeTopMargin)}>
        <Text variant="body2">Profile Name:</Text>
        <Text variant="caption1">{fields.name}</Text>
      </div>
      {cluster?.length && cluster[0] && (
        <div className={classes.calloutField}>
          <Text variant="body2">Cluster Name:</Text>
          <Text variant="caption1">{cluster[0].name}</Text>
        </div>
      )}
      <div className={clsx(classes.roleCounts, classes.largeTopMargin)}>
        <div className={classes.calloutField}>
          <Text variant="body2">Total Roles:</Text>
          <Text variant="caption1">{fields.roles.length}</Text>
        </div>
        <div className={classes.calloutField}>
          <Text variant="body2">Total Cluster Roles:</Text>
          <Text variant="caption1">{fields.clusterRoles.length}</Text>
        </div>
        <div className={classes.calloutField}>
          <Text variant="body2">Total Role Bindings:</Text>
          <Text variant="caption1">{fields.roleBindings.length}</Text>
        </div>
        <div className={classes.calloutField}>
          <Text variant="body2">Total Cluster Role Bindings:</Text>
          <Text variant="caption1">{fields.clusterRoleBindings.length}</Text>
        </div>
      </div>
    </div>
  )
}

const DeployNowButton = ({ wizardContext }) => {
  const classes = useStyles({})
  const [showDialog, setShowDialog] = useState(false)
  const [showError, setShowError] = useState(false)
  const clickedButton = () => {
    if (!!wizardContext?.cluster?.[0] && !wizardContext.cluster[0].hasBinding) {
      setShowDialog(true)
      setShowError(false)
    } else {
      setShowError(true)
    }
  }
  return (
    <>
      {showDialog && (
        <SkipDryRunDialog wizardContext={wizardContext} handleClose={() => setShowDialog(false)} />
      )}
      <SubmitButton onClick={clickedButton}>Deploy</SubmitButton>
      {showError && (
        <Text className={classes.error} variant="body2">
          Selected cluster may not have an active profile and must have profile agent installed.
        </Text>
      )}
    </>
  )
}

const renderAdditionalActions = (wizardContext, activeStep) => {
  if (activeStep !== 0) {
    return []
  }
  return [<DeployNowButton wizardContext={wizardContext} />]
}

const DeployRbacProfilePage = () => {
  const classes = useStyles({})
  const { history, match } = useReactRouter()
  const profileName = match?.params?.name
  const [profiles, profilesLoading] = useDataLoader(rbacProfileActions.list)
  // When wireframes are finalized for how to manage active profiles,
  // add below back in and display that info in the clusters list
  const profile = useMemo(() => profiles.find(propEq('name', profileName)), [profiles, profileName])
  const [submittingStep, setSubmittingStep] = useState(false)

  const initialContext = useMemo(() => {
    return {
      profileName,
      cluster: undefined,
      analysis: '',
    }
  }, [profileName])

  const onComplete = useCallback(
    (success) => success && history.push(routes.rbac.profiles.list.path()),
    [history],
  )

  const [updateProfileBindingAction, creating] = useDataUpdater(
    rbacProfileBindingsActions.create,
    onComplete,
  )

  return (
    <FormWrapper
      title="Deploy a Profile to a Cluster"
      backUrl={routes.rbac.profiles.list.path()}
      loading={profilesLoading || creating || submittingStep}
    >
      <DocumentMeta title="Deploy Profile" bodyClasses={['form-view']} />
      {profile && (
        <Wizard
          buttonCalloutMargin={396}
          onComplete={updateProfileBindingAction}
          context={initialContext}
          additionalActions={renderAdditionalActions}
          submitLabel="Deploy"
          hideBack
        >
          {({ wizardContext, setWizardContext, onNext, handleNext }) => (
            <WizardMeta
              className={classes.wizardMeta}
              fields={profile}
              calloutFields={profileCalloutFields}
              renderLabels={renderProfileCalloutFields(wizardContext.cluster)}
            >
              <WizardStep stepId="step1" label="Select a Cluster">
                <SelectClusterStep
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                  onNext={onNext}
                  handleNext={handleNext}
                  setSubmitting={setSubmittingStep}
                />
              </WizardStep>
              <WizardStep stepId="step2" label="Impact Analysis">
                <DriftAnalysis analysisString={wizardContext.analysis} />
              </WizardStep>
            </WizardMeta>
          )}
        </Wizard>
      )}
    </FormWrapper>
  )
}

export default DeployRbacProfilePage
