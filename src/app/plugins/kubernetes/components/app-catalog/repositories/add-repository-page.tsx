import React from 'react'
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
import ClustersListCard from './clusters-list-card'
import { RepositoryType, repositoryOptions } from './models'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { repositoryActions } from './actions'
import { useSelector } from 'react-redux'
import { RootState } from 'app/store'
import { SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import { pathOr, prop } from 'ramda'
import { allKey, CustomerTiers } from 'app/constants'
import useReactRouter from 'use-react-router'
const FormWrapper: any = FormWrapperDefault // types on forward ref .js file dont work well.

const useStyles = makeStyles((theme: Theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridTemplateColumns: '480px 440px',
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
}))

const customerTierBlacklist = [CustomerTiers.Freedom]

const AddRepositoryPage = () => {
  const classes = useStyles()
  const { history } = useReactRouter()
  const anyRepositoryActions = repositoryActions as any
  const [addRepo, addingRepo] = useDataUpdater(anyRepositoryActions.create)
  const [addClustersToRepository, addingClustersToRepository] = useDataUpdater(
    anyRepositoryActions.addClustersToRepository,
  )

  const session = useSelector<RootState, SessionState>(prop(sessionStoreKey))
  const { username, features } = session
  const customerTier = pathOr(CustomerTiers.Freedom, ['customer_tier'], features)

  const initialContext = {
    repositoryType: RepositoryType.Public,
    searchTerm: '',
    clusters: customerTierBlacklist.includes(customerTier) ? allKey : [],
  }

  const handleSubmit = async (wizardContext) => {
    const { name, url, username, password } = wizardContext
    const [success, newRepo] = await addRepo({
      name: name.replace(/\s+/g, '_'), // Replace all whitespaces with underscores
      url,
      username,
      password,
    })

    if (success && wizardContext.clusters.length) {
      await addClustersToRepository({
        repoName: newRepo.name,
        clusterIds: wizardContext.clusters,
      })
    }

    history.push(routes.repositories.list.path()), [history]
  }

  return (
    <>
      <DocumentMeta title="Add Repository" />
      <FormWrapper
        title="Add New Repository"
        isUpdateForm={true}
        loading={addingRepo || addingClustersToRepository}
      >
        <Wizard
          context={initialContext}
          onComplete={handleSubmit}
          hideBack={true}
          submitLabel="Save"
          onCancel={() => history.push(routes.repositories.list.path())}
        >
          {({ wizardContext, setWizardContext, onNext }) => {
            return (
              <>
                <WizardStep stepId="step1" label="Add Repository" keepContentMounted={false}>
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
                          <TextField
                            id="name"
                            label="Repository Name"
                            className={classes.textField}
                            onChange={(value) => setWizardContext({ repositoryName: value })}
                            required
                          />
                          <TextField
                            id="url"
                            label="Repository URL"
                            className={classes.textField}
                            onChange={(value) => setWizardContext({ repositoryUrl: value })}
                            required
                          />
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
                        title="ASSIGN CLUSTERS"
                        wizardContext={wizardContext}
                        setWizardContext={setWizardContext}
                        username={username}
                        customerTier={customerTier}
                        customerTierBlacklist={customerTierBlacklist}
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

export default AddRepositoryPage
