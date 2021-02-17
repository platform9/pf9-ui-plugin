// @ts-nocheck
import React, { useMemo } from 'react'
import FormWrapperDefault from 'core/components/FormWrapper'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import DocumentMeta from 'core/components/DocumentMeta'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import Text from 'core/elements/text'
import TextField from 'core/components/validatedForm/TextField'
import RadioFields from 'core/components/validatedForm/radio-fields'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import { routes } from 'core/utils/routes'
import useReactRouter from 'use-react-router'
import { repositoryOptions, RepositoryType } from './models'
import ClustersListCard from './clusters-list-card'
import useDataLoader from 'core/hooks/useDataLoader'
import { repositoryActions } from './actions'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { propEq } from 'ramda'
import { emptyObj } from 'utils/fp'
const FormWrapper: any = FormWrapperDefault // types on forward ref .js file dont work well.

const useStyles = makeStyles((theme: Theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridTemplateColumns: 'minmax(480px, max-content) 440px',
    gridGap: theme.spacing(3),
    margin: theme.spacing(3, 0, 3, 0),
  },
  card: {
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: 4,
    boxShadow: 'none',
    height: 'max-content',
  },
  title: {
    color: theme.palette.grey[700],
  },
  fields: {
    marginLeft: theme.spacing(2),
  },
  textField: {
    minWidth: '80%',
  },
  loginDetails: {
    marginTop: theme.spacing(2),
  },
  repoTypes: {
    display: 'grid',
    gridTemplateColumns: '50px auto',
    marginTop: theme.spacing(1),
  },
  repoTypeText: {
    marginTop: theme.spacing(2),
  },
  label: {
    ...theme.typography.body2,
  },
  repoInfo: {
    display: 'grid',
    gridTemplateColumns: '120px 1fr',
    gridTemplateRows: '40px',
    gridGap: theme.spacing(1),
  },
}))

const EditRepoPage = () => {
  const classes = useStyles()
  const { history, match } = useReactRouter()
  const repoName = match.params.id
  const [repos, loading] = useDataLoader(repositoryActions.list)
  const anyRepositoryActions = repositoryActions as any
  const [updateRepo, updatingRepo] = useDataUpdater(anyRepositoryActions.update)
  const [deleteClustersFromRepository, deletingRepoFromClusters] = useDataUpdater(
    anyRepositoryActions.deleteClustersFromRepository,
  )
  const [addClustersToRepository, addingRepoToClusters] = useDataUpdater(
    anyRepositoryActions.addClustersToRepository,
  )

  const repo = useMemo(() => repos.find(propEq('name', repoName)) || emptyObj, [repos])

  const submitForm = async (wizardContext) => {
    const [success, updatedRepo] = await updateRepo(wizardContext)
    if (success) {
      // Find clusters that were removed
      const clustersToRemove = repo.clusters.filter(
        (clusterId) => !wizardContext.clusters.includes(clusterId),
      )
      if (clustersToRemove.length) {
        await deleteClustersFromRepository({ repoName: repo.name, clusterIds: clustersToRemove })
      }

      // Find clusters that were added
      const clustersToAdd = wizardContext.clusters.filter(
        (clusterId) => !repo.clusters.includes(clusterId),
      )
      if (clustersToAdd.length) {
        await addClustersToRepository({
          repoName: updatedRepo.name,
          clusterIds: clustersToAdd,
        })
      }
    }
    history.push(routes.repositories.list.path())
  }

  const initialContext = useMemo(
    () => ({
      name: repo.name,
      url: repo.url,
      repositoryType: repo.private ? RepositoryType.Private : RepositoryType.Public,
      clusters: repo.clusters,
    }),
    [repo],
  )

  const submitting = updatingRepo || deletingRepoFromClusters || addingRepoToClusters

  return (
    <>
      <DocumentMeta title="Edit Repository" />
      <FormWrapper
        title="Edit Repository"
        isUpdateForm={true}
        loading={loading || submitting}
        message={submitting ? 'Submitting form...' : 'Loading...'}
      >
        <Wizard
          context={initialContext}
          onComplete={submitForm}
          hideBack={true}
          submitLabel="Save"
          onCancel={() => history.push(routes.repositories.list.path())}
        >
          {({ wizardContext, setWizardContext, onNext }) => {
            return (
              <>
                <WizardStep stepId="step1" label="Edit Repository" keepContentMounted={false}>
                  <ValidatedForm
                    title="Add Repo"
                    elevated={false}
                    initialValues={wizardContext}
                    onSubmit={setWizardContext}
                    triggerSubmit={onNext}
                  >
                    <div className={classes.validatedFormContainer}>
                      <FormFieldCard
                        className={classes.card}
                        title={
                          <Text variant="caption1" className={classes.title} component="span">
                            SETTINGS
                          </Text>
                        }
                      >
                        <div className={classes.fields}>
                          <div className={classes.repoInfo}>
                            <Text variant="body2">Repository Name: </Text>
                            <Text variant="caption1">{repo.name}</Text>
                            <Text variant="body2">Repository URL: </Text>
                            <Text variant="caption1">{repo.url}</Text>
                          </div>
                          {wizardContext.repositoryType === RepositoryType.Private && (
                            <div className={classes.loginDetails}>
                              <TextField
                                id="username"
                                label="Username"
                                className={classes.textField}
                                onChange={(value) => setWizardContext({ username: value })}
                                required
                              />
                              <TextField
                                id="password"
                                label="Password"
                                className={classes.textField}
                                onChange={(value) => setWizardContext({ password: value })}
                                required
                              />
                            </div>
                          )}
                          <div className={classes.repoTypes}>
                            <Text className={classes.repoTypeText} variant="body2">
                              Type:
                            </Text>
                            <RadioFields
                              formControlLabelClasses={{ label: classes.label }}
                              id="repositoryType"
                              options={repositoryOptions}
                              value={wizardContext.repositoryType}
                              onChange={(value) => setWizardContext({ repositoryType: value })}
                            />
                          </div>
                          {
                            // Backend doesn't support Global Default yet so this might go in the next release
                            /* <CheckboxField  
                            formControlLabelClasses={{ label: classes.label }}
                            id="globalDefault"
                            label="Set as Global Default"
                            onChange={(value) => setWizardContext({ globalDefault: value })}
                          /> */
                          }
                        </div>
                      </FormFieldCard>
                      <ClustersListCard
                        title="ADD/REMOVE CLUSTERS"
                        wizardContext={wizardContext}
                        setWizardContext={setWizardContext}
                      />
                    </div>
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

export default EditRepoPage
