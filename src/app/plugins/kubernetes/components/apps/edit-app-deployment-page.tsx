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
import React, { useMemo, useRef, useState } from 'react'
import Text from 'core/elements/text'
import CodeMirror from 'core/components/validatedForm/CodeMirror'
import SimpleLink from 'core/components/SimpleLink'
import { ErrorMessage } from 'core/components/validatedForm/ErrorMessage'
import useReactRouter from 'use-react-router'
import AppVersionPicklistField from './app-version-picklist-field'
import useDataLoader from 'core/hooks/useDataLoader'
import { deploymentDetailLoader, releaseActions } from './actions'
import PicklistField from 'core/components/validatedForm/PicklistField'
import useDataUpdater from 'core/hooks/useDataUpdater'
import ClusterPicklist from '../common/ClusterPicklist'
import NamespacePicklist from '../common/NamespacePicklist'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
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

const placeholderIcon = '/ui/images/app-catalog/app-cat-placeholder-logo@2x.png'

const wizardMetaFormattedNames = {
  version: 'Latest Version',
  repository: 'Repository',
  info: 'Info',
}

const wizardMetaCalloutFields = ['version', 'repository', 'info']

const AppIcon = ({ appName, logoUrl }) => {
  const classes = useStyles()
  const imgSource = logoUrl && logoUrl.match(/.(jpg|jpeg|png|gif)/) ? logoUrl : placeholderIcon
  return (
    <div className={classes.logoContainer}>
      <img alt={appName} src={imgSource} />
    </div>
  )
}

const EditAppDeploymentPage = () => {
  const classes = useStyles()
  const { match, history } = useReactRouter()
  const fileInputRef = useRef(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const name = match.params['name']

  const [deployedAppDetails, loadingDeployedAppDetails] = useDataLoader(deploymentDetailLoader)
  const [updateDeployedApp, updatingDeployedApp] = useDataUpdater(releaseActions.update)

  //   const [[appDetail = {}], loadingAppDetail] = useDataLoader(appDetailsLoader, {
  //     name,
  //     repository,
  //   })

  const initialContext = useMemo(
    () => ({
      deploymentName: name,
      version: '1.45',
      clusterId: '6e64871b-3cbf-450f-8476-aa0b92a784af',
      namespace: 'platform9-system',
      useDefaultValues: true,
      values: 'default values',
      info: 'www.google.com/hello/kimberly/nguy',
    }),
    [deployedAppDetails],
  )

  const appVersions = []

  //   const appVersions = useMemo(() => {
  //     const versions = appDetail.Versions?.slice(0, 10)
  //     if (!versions) {
  //       return []
  //     }
  //     return versions.map((version) => ({ value: version, label: version }))
  //   }, [appDetail])

  const handleSubmit = async (wizardContext) => {
    const { releaseName, clusterId, namespace, version, values, useDefaultValues } = wizardContext
    const action = parseFloat(version) >= parseFloat('1.52') ? 'upgrade' : 'rollback'

    // If useDefaultValues is true, meaning we use the chart's default values.yaml file, then there's no need
    // to send the values to the API. When the API gives us the chart's default values, it is in object form.
    // However, the deploy app API only accepts values as a string or byte blob. If we stringify the values object,
    // and send it in the deploy request body, not sure if the API can read it. That's why it's better to send
    // values as undefined if we're using the default values.yaml
    const vals = useDefaultValues ? undefined : values

    const [success] = await updateDeployedApp({
      clusterId,
      namespace,
      releaseName,
      action,
      version,
      vals,
    })
    if (success) {
      history.push(routes.apps.list.path())
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

  const loading = loadingDeployedAppDetails

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
              icon={<AppIcon appName={name} logoUrl={''} />}
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
                    <Text variant="subtitle1">{'App Name'}</Text>

                    <Text variant="body2" className={classes.infoText}>
                      {'App Description'}
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
                        upload.yaml
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
                      onChange={(value) =>
                        setWizardContext({ values: 'default value', useDefaultValues: value })
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
