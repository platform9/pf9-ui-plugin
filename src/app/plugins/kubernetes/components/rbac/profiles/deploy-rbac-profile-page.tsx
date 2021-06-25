import React, { useCallback, useEffect, useMemo } from 'react'
import FormWrapper from 'core/components/FormWrapper'
import useDataLoader from 'core/hooks/useDataLoader'
import { routes } from 'core/utils/routes'
import useReactRouter from 'use-react-router'
import { rbacProfileBindingsActions, rbacProfileActions } from './actions'
import { propEq } from 'ramda'
import DocumentMeta from 'core/components/DocumentMeta'
import Wizard from 'core/components/wizard/Wizard'
import WizardMeta from 'core/components/wizard/WizardMeta'
import WizardStep from 'core/components/wizard/WizardStep'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import Text from 'core/elements/text'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import clsx from 'clsx'
import ListTableField from 'core/components/validatedForm/ListTableField'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import { cloudProviderTypes } from 'k8s/components/infrastructure/cloudProviders/selectors'
import { capitalizeString } from 'utils/misc'
import useDataUpdater from 'core/hooks/useDataUpdater'

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
  card: {
    background: theme.palette.grey['000'],
    padding: 40,
  },
  cardTitle: {
    marginBottom: theme.spacing(2),
  },
}))

const profileCalloutFields = [
  'name',
  'roles',
  'roleBindings',
  'clusterRoles',
  'clusterRoleBindings',
]

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'kubeRoleVersion', label: 'Version' },
  {
    id: 'cloudProviderType',
    label: 'Cloud Provider',
    render: (type) => cloudProviderTypes[type] || capitalizeString(type),
  },
  {
    id: 'enableProfileAgent',
    label: 'Profile Agent',
    render: (enabled) => (enabled ? 'Yes' : 'No'),
  },
]

const profileAgentInstalled = (cluster) => !!cluster.enableProfileAgent

const renderProfileCalloutFields = () => (fields) => {
  const classes = useStyles({})
  return (
    <div className={classes.wizardMetaContainer}>
      <Text variant="caption1">PROFILE SUMMARY</Text>
      <div className={clsx(classes.calloutField, classes.largeTopMargin)}>
        <Text variant="body2">Profile Name:</Text>
        <Text variant="caption1">{fields.name}</Text>
      </div>
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

const DeployRbacProfilePage = () => {
  const classes = useStyles({})
  const { history, match } = useReactRouter()
  const profileName = match?.params?.name
  const [profiles, profilesLoading] = useDataLoader(rbacProfileActions.list)
  // When wireframes are finalized for how to manage active profiles,
  // add below back in and display that info in the clusters list
  const [, , refreshProfileBindings] = useDataLoader(rbacProfileBindingsActions.list)
  const [clusters, clustersLoading] = useDataLoader(clusterActions.list)
  const profile = useMemo(() => profiles.find(propEq('name', profileName)), [profiles, profileName])

  const initialContext = useMemo(() => {
    return {
      profileName,
      cluster: undefined,
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

  useEffect(() => {
    refreshProfileBindings(true)
  }, [])

  return (
    <FormWrapper
      title="Deploy a Profile to a Cluster"
      backUrl={routes.rbac.profiles.list.path()}
      loading={profilesLoading || creating}
    >
      <DocumentMeta title="Deploy Profile" bodyClasses={['form-view']} />
      {profile && (
        <Wizard
          buttonCalloutMargin={396}
          onComplete={updateProfileBindingAction}
          context={initialContext}
        >
          {({ wizardContext, setWizardContext, onNext }) => (
            <WizardMeta
              className={classes.wizardMeta}
              fields={profile}
              calloutFields={profileCalloutFields}
              renderLabels={renderProfileCalloutFields()}
            >
              <WizardStep stepId="step1" label="Select a Cluster">
                <ValidatedForm
                  classes={{ root: classes.validatedFormContainer }}
                  initialValues={wizardContext}
                  onSubmit={setWizardContext}
                  triggerSubmit={onNext}
                  title="Select a Cluster to Deploy to"
                >
                  <Text variant="body2">
                    Choose a cluster to deploy this RBAC profile to. The cluster will use the RBAC
                    permissions that currently belong to the RBAC profile. If you make changes to a
                    profile, you will need to redeploy the profile to any clusters you wish to use
                    the updated permissions.
                  </Text>
                  <Text variant="body2" className={classes.largeTopMargin}>
                    RBAC profiles may only be deployed onto clusters with Kubernetes version 1.2+
                    that have Profile Agent installed.
                  </Text>
                  <ListTableField
                    id="cluster"
                    data={clusters}
                    loading={clustersLoading}
                    columns={columns}
                    onChange={(value) => setWizardContext({ cluster: value })}
                    value={wizardContext.cluster}
                    checkboxCond={profileAgentInstalled}
                    required
                  />
                </ValidatedForm>
              </WizardStep>
              <WizardStep stepId="step2" label="Impact Analysis">
                <div className={classes.card}>
                  <Text variant="subtitle1" className={classes.cardTitle}>
                    Impact Analysis is coming soon.
                  </Text>
                  <Text variant="body1">
                    Impact Analysis will make it possible to see the impacted changes in RBAC
                    permissions on a cluster before deploying an RBAC profile to that cluster.
                  </Text>
                </div>
              </WizardStep>
            </WizardMeta>
          )}
        </Wizard>
      )}
    </FormWrapper>
  )
}

export default DeployRbacProfilePage
