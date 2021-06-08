import { makeStyles } from '@material-ui/styles'
import PrevButton from 'core/components/buttons/PrevButton'
import DocumentMeta from 'core/components/DocumentMeta'
import FormWrapper from 'core/components/FormWrapper'
import SubmitButton from 'core/components/buttons/SubmitButton'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import Text from 'core/elements/text'
import useDataLoader from 'core/hooks/useDataLoader'
import useReactRouter from 'use-react-router'
import Theme from 'core/themes/model'
import { sort } from 'ramda'
import React, { useMemo, useState } from 'react'
import { objSwitchCase } from 'utils/fp'
import { compareVersions } from '../app-catalog/helpers'
import AddCloudProviderCredentialStep from '../infrastructure/cloudProviders/AddCloudProviderCredentialStep'
import { formTitle } from '../infrastructure/cloudProviders/AddCloudProviderPage'
import { CloudProviders } from '../infrastructure/cloudProviders/model'
import { loadSupportedRoleVersions } from '../infrastructure/clusters/actions'
import AddCoworkerStep from './add-coworker-step'
import CreateBareOsClusterPage from './create-bareos-cluster-page'
import CreateCloudClusterPage from './create-cloud-cluster-page'
import DeploymentCard from './deployment-card'
import { routes } from 'core/utils/routes'
import Button from 'core/elements/button'
import ImportClusterPage from './import-cluster-page'
import useScopedPreferences from 'core/session/useScopedPreferences'
import { UserPreferences } from 'app/constants'
const objSwitchCaseAny: any = objSwitchCase // types on forward ref .js file dont work well.

const useStyles = makeStyles((theme: Theme) => ({
  welcomeContainer: {
    display: 'grid',
    gridTemplateColumns: 'max-content 1fr',
    gridGap: theme.spacing(8),
  },
  welcomeContent: {
    display: 'grid',
    gridGap: theme.spacing(4),
  },
  descriptionText: {
    width: '700px',
  },
  deploymentChoices: {
    display: 'grid',
    gridGap: theme.spacing(4),
  },
  newClusterChoices: {
    display: 'grid',
    gridTemplateColumns: 'max-content max-content',
    gridGap: theme.spacing(4),
  },
  actionRow: {
    display: 'grid',
  },
  button: {
    margin: theme.spacing(1),
    borderRadius: 2,
    textTransform: 'none',
  },
}))

export type ClusterChoice = 'bareOs' | 'cloud' | 'import'

const OnboardingPage = () => {
  const classes = useStyles()
  const { history } = useReactRouter()
  const [clusterChoice, setClusterChoice] = useState<ClusterChoice>('bareOs')
  const [, , , updateUserDefaults] = useScopedPreferences('defaults')
  const [kubernetesVersions] = useDataLoader(loadSupportedRoleVersions)

  const defaultKubernetesVersion = useMemo(() => {
    const versionsList = kubernetesVersions?.map((obj) => obj.roleVersion) || []
    const sortedVersions = sort(compareVersions, versionsList) // this sorts the versions from low-high
    return sortedVersions[sortedVersions.length - 1]
  }, [kubernetesVersions])

  const initialContext = {
    clusterName: 'PF9-single-node-cluster',
    kubeRoleVersion: defaultKubernetesVersion,
    cloudProviderId: '98421be9-f902-4c5b-a7f4-45f55bd530d0',
  }

  const cloudProviderOptions = useMemo(
    () =>
      ({
        cloud: [CloudProviders.Aws, CloudProviders.Azure],
        import: [CloudProviders.Aws, CloudProviders.Azure, CloudProviders.Google],
      }[clusterChoice]),
    [clusterChoice],
  )

  const BuildClusterStep = useMemo(() => {
    return objSwitchCaseAny({
      bareOs: CreateBareOsClusterPage,
      cloud: CreateCloudClusterPage,
      import: ImportClusterPage,
    })(clusterChoice)
  }, [clusterChoice])

  const handleFormCompletion = () => {
    updateUserDefaults(UserPreferences.FeatureFlags, { showOnboarding: false })
    console.log('user default updated')
    history.push(routes.cluster.list.path())
  }

  const handleDeploymentCardClick = (setWizardContext, handleNext, setActiveStep) => (
    type: ClusterChoice,
  ) => {
    setClusterChoice(type)
    setWizardContext({ clusterChoice: type })
    if (type === 'bareOs') {
      setActiveStep('step3', 2) // Step num is 2 because the step count starts at 0
      return
    }

    setWizardContext({ provider: CloudProviders.Aws }) // set AWS as the default one for now
    handleNext()
  }

  const handleStepThreeBackButtonClick = (handleBack, setActiveStep, onNext) => () => {
    if (clusterChoice === 'bareOs') {
      setActiveStep('step1', 0)
      return
    }

    handleBack()
  }

  return (
    <>
      <DocumentMeta title="Onboarding" bodyClasses={['form-view']} />
      <FormWrapper title="">
        <Wizard context={initialContext} onComplete={handleFormCompletion} hideAllButtons={true}>
          {({ wizardContext, setWizardContext, onNext, handleNext, handleBack, setActiveStep }) => {
            return (
              <>
                <WizardStep stepId="step1" label="Welcome" keepContentMounted={false}>
                  <div className={classes.welcomeContainer}>
                    <img src={'/ui/images/management-plane.svg'} />
                    <div className={classes.welcomeContent}>
                      <Text variant="h5">Welcome to Platform9</Text>
                      <Text variant="body2" className={classes.descriptionText}>
                        To get started we are going to build your first cluster. You will be able to
                        deploy using a Virtual Machine, Physical Server or pubic cloud services on
                        AWS or Azure. If you have clusters in EKS, AKS or GKE you can select to
                        import them too.
                      </Text>
                      <div className={classes.deploymentChoices}>
                        <div className={classes.newClusterChoices}>
                          <DeploymentCard
                            type="bareOs"
                            imageNames={['virtualMachine', 'physicalMachine']}
                            label="My Infrastucture"
                            onClick={handleDeploymentCardClick(
                              setWizardContext,
                              handleNext,
                              setActiveStep,
                            )}
                          />
                          <DeploymentCard
                            type="cloud"
                            imageNames={['azure', 'aws']}
                            label="Build on Public Cloud"
                            onClick={handleDeploymentCardClick(
                              setWizardContext,
                              handleNext,
                              setActiveStep,
                            )}
                          />
                        </div>
                        <DeploymentCard
                          type="import"
                          imageNames={['gke', 'aks', 'eks']}
                          label="Import GKE, AKS, or EKS"
                          onClick={handleDeploymentCardClick(
                            setWizardContext,
                            handleNext,
                            setActiveStep,
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </WizardStep>
                <WizardStep
                  stepId="step2"
                  label="Configure Your Infrastructure"
                  keepContentMounted={false}
                >
                  <AddCloudProviderCredentialStep
                    wizardContext={wizardContext}
                    setWizardContext={setWizardContext}
                    onNext={onNext}
                    handleNext={handleNext}
                    title={formTitle(wizardContext)}
                    setSubmitting={() => {}}
                    cloudProviderOptions={cloudProviderOptions}
                    header={
                      clusterChoice === 'import' ? 'Select the Cloud to Import Clusters From' : null
                    }
                  />
                  <PrevButton onClick={handleBack} />
                  <SubmitButton onClick={handleNext}>+ Save Cloud Provider</SubmitButton>
                </WizardStep>
                <WizardStep stepId="step3" label="Build Your Cluster" keepContentMounted={false}>
                  <BuildClusterStep
                    onNext={onNext}
                    handleNext={handleNext}
                    wizardContext={wizardContext}
                    setWizardContext={setWizardContext}
                  />
                  <PrevButton
                    onClick={handleStepThreeBackButtonClick(handleBack, setActiveStep, onNext)}
                  />
                  <SubmitButton onClick={handleNext}>+ Create Cluster</SubmitButton>
                </WizardStep>
                <WizardStep stepId="step4" label="Invite a Coworker" keepContentMounted={false}>
                  <AddCoworkerStep
                    onNext={onNext}
                    wizardContext={wizardContext}
                    setWizardContext={setWizardContext}
                  />
                  <Button
                    color="secondary"
                    className={classes.button}
                    onClick={() => history.push(routes.cluster.list.path())}
                  >
                    Skip
                  </Button>
                  <SubmitButton className={classes.button} onClick={handleNext}>
                    + Invite and Done
                  </SubmitButton>
                </WizardStep>
              </>
            )
          }}
        </Wizard>
      </FormWrapper>
    </>
  )
}

export default OnboardingPage
