import { makeStyles } from '@material-ui/core/styles'
import DocumentMeta from 'core/components/DocumentMeta'
import FormWrapperDefault from 'core/components/FormWrapper'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Wizard from 'core/components/wizard/Wizard'
import WizardMeta from 'core/components/wizard/WizardMeta'
import WizardStep from 'core/components/wizard/WizardStep'
import Theme from 'core/themes/model'
import { routes } from 'core/utils/routes'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import Text from 'core/elements/text'
import CodeMirror from 'core/components/validatedForm/CodeMirror'
import SimpleLink from 'core/components/SimpleLink'
import { ErrorMessage } from 'core/components/validatedForm/ErrorMessage'
import useReactRouter from 'use-react-router'
import AppVersionPicklistField from './app-version-picklist-field'
import useDataLoader from 'core/hooks/useDataLoader'
import { appDetailsLoader, deploymentDetailLoader, deployedAppActions } from './actions'
import PicklistField from 'core/components/validatedForm/PicklistField'
import useDataUpdater from 'core/hooks/useDataUpdater'
import NamespacePicklist from '../common/NamespacePicklist'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import {
  compareVersions,
  filterConnectedClusters,
  getAppVersionPicklistOptions,
  getIcon,
} from './helpers'
import ClusterPicklist from '../common/ClusterPicklist'
import { repositoryActions } from '../repositories/actions'
const FormWrapper: any = FormWrapperDefault // types on forward ref .js file dont work well.

const useStyles = makeStyles<Theme>((theme) => ({
  deployAppForm: {
    marginTop: theme.spacing(3),
    gridGap: theme.spacing(4),
  },
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
  chartInfo: {
    maxWidth: '800px',
    display: 'grid',
    gridGap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  fields: {
    display: 'grid',
    gridColumnGap: theme.spacing(3),
    marginBottom: theme.spacing(4),
    gridTemplateColumns: '1fr 1fr',
    '& .MuiFormControl-root.validatedFormInput': {
      width: '100%',
    },
  },
  clusterField: {
    gridColumnStart: 1,
    gridColumnEnd: 1,
  },
  namespaceField: {
    gridColumnStart: 2,
    gridColumnEnd: 2,
  },
  infoText: {
    color: theme.palette.grey[700],
  },
  code: {
    width: '750px',
    margin: theme.spacing(2, 0, 2, 0),
    '& .MuiFormControl-root.validatedFormInput': {
      maxWidth: '750px',
      width: '100%',
      marginTop: theme.spacing(0),
    },
  },
  codeMirror: {
    width: '750px',
    '& .CodeMirror': {
      background: theme.palette.common.white,
    },
    '& .CodeMirror-gutters': {
      backgroundColor: theme.palette.common.white,
      borderRight: '0px',
    },
  },
  logoContainer: {
    borderRadius: '2px',
    border: `solid 0.5px ${theme.palette.grey[300]}`,
    backgroundColor: theme.palette.grey['000'],
    width: 240,
    height: 140,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1.5, 0, 0.5, 0),
    '& img': {
      maxWidth: 160,
      maxHeight: 100,
    },
  },
}))

const appListPageUrl = routes.apps.list.path()

const wizardMetaFormattedNames = {
  version: 'Latest Version',
  repository: 'Repository',
  info: 'Info',
}

const wizardMetaCalloutFields = ['version', 'repository', 'info']

const AppIcon = ({ appName, icon }) => {
  const classes = useStyles()
  return (
    <div className={classes.logoContainer}>
      <img alt={appName} src={getIcon(icon)} />
    </div>
  )
}

const EditAppDeploymentPage = () => {
  const classes = useStyles()
  const { match, history } = useReactRouter()
  const fileInputRef = useRef(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const name = match.params['name']
  const clusterId = match.params['clusterId']
  const namespace = match.params['namespace']

  const [deployedApps, loadingDeployedApps] = useDataLoader(deployedAppActions.list, {
    clusterId,
    namespace,
  })
  const deployedApp = deployedApps.find((app) => app.name === name) || {}
  const { repository, chart, chart_version: chartVersion } = deployedApp
  const [repositories, loadingRepositories] = useDataLoader(repositoryActions.list)
  const [[deployedAppDetails] = {}, loadingDeployedAppDetails]: any = useDataLoader(
    deploymentDetailLoader,
    {
      releaseName: name,
      clusterId,
      namespace,
    },
  )

  // We also need to load app/chart detail for other additional info such as app/chart versions
  const [[appDetail = {}], loadingAppDetail] = useDataLoader(appDetailsLoader, {
    name: chart,
    repository: repository,
  })

  const [updateDeployedApp, updatingDeployedApp] = useDataUpdater(deployedAppActions.update)

  const defaultStructuredValues = JSON.stringify(deployedAppDetails?.chart?.values, null, 1)

  const initialContext = useMemo(
    () => ({
      deploymentName: name,
      version: chartVersion,
      repository: repository,
      clusterId: clusterId,
      namespace: namespace,
      useDefaultValues: false,
      values: JSON.stringify(deployedAppDetails?.config, null, 1),
      info: appDetail?.metadata?.home,
    }),
    [deployedAppDetails, appDetail, name, clusterId, namespace],
  )

  // Only version upgrades are available to the user so we must filter out the list of
  // app versions to only include versions >= to the deployed app's current version
  const availableVersions = useMemo(() => {
    if (!appDetail?.Versions || !chartVersion) {
      return []
    }
    return appDetail.Versions.filter((version) => compareVersions(version, chartVersion) >= 0)
  }, [appDetail, deployedAppDetails])
  const appVersions = useMemo(() => getAppVersionPicklistOptions(availableVersions), [appDetail])

  const handleSubmit = async (wizardContext) => {
    const {
      deploymentName,
      clusterId,
      namespace,
      version,
      values,
      useDefaultValues,
    } = wizardContext

    const vals = useDefaultValues ? JSON.stringify(deployedAppDetails?.chart?.values) : values

    const [success] = await updateDeployedApp({
      clusterId,
      namespace,
      deploymentName,
      chart,
      repository,
      action: 'upgrade',
      version,
      values: vals,
    })
    if (success) {
      history.push(routes.apps.list.path())
    } else {
      setErrorMessage('ERROR: Cannot edit deployed app')
    }
  }

  const openFileBrowser = () => {
    fileInputRef.current.click()
  }

  const handleFileUpload = (setWizardContext) => (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = function() {
      setWizardContext({ values: reader.result, useDefaultValues: false })
    }
    reader.onerror = function() {
      setErrorMessage('Error: Cannot read file')
    }

    reader.readAsText(file)
  }

  // Filter the clusters list and return only the clusters that are connected to this repository
  const filterClusters = useCallback(
    (clusters) => filterConnectedClusters(repository, repositories, clusters),
    [repositories],
  )

  const loading =
    loadingDeployedAppDetails || loadingDeployedApps || loadingRepositories || loadingAppDetail

  return (
    <>
      <DocumentMeta title="Edit Deployed Application" bodyClasses={['form-view']} />
      <FormWrapper
        title="Edit Deployed Application"
        loading={loading || updatingDeployedApp}
        renderContentOnMount={!loading}
        message={loading ? 'Loading' : 'Submitting'}
        backUrl={appListPageUrl}
        isUpdateForm={true}
      >
        <Wizard context={initialContext} submitLabel="Deploy" onComplete={handleSubmit}>
          {({ wizardContext, setWizardContext, onNext }) => (
            <WizardMeta
              className={classes.deployAppForm}
              fields={wizardContext}
              icon={<AppIcon appName={name} icon={deployedAppDetails?.chart?.metadata?.icon} />}
              keyOverrides={wizardMetaFormattedNames}
              calloutFields={wizardMetaCalloutFields}
            >
              <WizardStep stepId="deploy">
                <ValidatedForm
                  classes={{ root: classes.validatedFormContainer }}
                  fullWidth
                  initialValues={wizardContext}
                  onSubmit={setWizardContext}
                  triggerSubmit={onNext}
                  elevated={false}
                >
                  <div className={classes.chartInfo}>
                    <Text variant="subtitle1">{name}</Text>

                    <Text variant="body2" className={classes.infoText}>
                      {deployedAppDetails?.chart?.metadata?.description}
                    </Text>
                  </div>
                  <FormFieldCard>
                    <div className={classes.fields}>
                      <TextField
                        className={classes.nameField}
                        id="deploymentName"
                        label="Deployment Name"
                        disabled
                      />
                      <div className={classes.clusterField}>
                        <PicklistField
                          DropdownComponent={ClusterPicklist}
                          id="clusterId"
                          label="Cluster"
                          onChange={(value) => setWizardContext({ clusterId: value })}
                          filterFn={filterClusters}
                          disabled
                        />
                      </div>
                      <div className={classes.namespaceField}>
                        <PicklistField
                          DropdownComponent={NamespacePicklist}
                          id="namespace"
                          label="Namespace"
                          clusterId={wizardContext.clusterId}
                          onChange={(value) => setWizardContext({ namespace: value })}
                          disabled
                        />
                      </div>
                      <AppVersionPicklistField options={appVersions} />
                    </div>
                    <Text variant="body2">
                      {'Enter value details below or '}
                      <SimpleLink src="" onClick={openFileBrowser}>
                        upload a values.yaml file
                      </SimpleLink>
                      <input
                        type="file"
                        id="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".yaml"
                        onChange={handleFileUpload(setWizardContext)}
                      />
                    </Text>
                    <fieldset className={classes.code}>
                      <legend>Values</legend>
                      <CodeMirror
                        id="values"
                        value={wizardContext.values}
                        onChange={(values) => {
                          setWizardContext({ values, useDefaultValues: false })
                        }}
                        className={classes.codeMirror}
                      />
                    </fieldset>
                    <CheckboxField
                      id="useDefaultValues"
                      value={wizardContext.useDefaultValues}
                      label="Use default structured values"
                      onChange={(checked) =>
                        setWizardContext({
                          values: checked
                            ? defaultStructuredValues
                            : JSON.stringify(deployedAppDetails?.config, null, 1),
                          useDefaultValues: checked,
                        })
                      }
                    />
                    {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
                  </FormFieldCard>
                </ValidatedForm>
              </WizardStep>
            </WizardMeta>
          )}
        </Wizard>
      </FormWrapper>
    </>
  )
}

export default EditAppDeploymentPage
