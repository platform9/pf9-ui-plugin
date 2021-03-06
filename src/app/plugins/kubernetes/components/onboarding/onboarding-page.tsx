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
import React, { useCallback, useMemo, useState } from 'react'
import { objSwitchCase } from 'utils/fp'
import { CloudProviders } from '../infrastructure/cloudProviders/model'
import AddCoworkerStep from './add-coworker-step'
import CreateBareOsClusterPage from './create-bareos-cluster-page'
import CreateCloudClusterPage from './create-cloud-cluster-page'
import DeploymentCard from './deployment-card'
import { routes } from 'core/utils/routes'
import Button from 'core/elements/button'
import ImportClusterPage from './import-cluster-page'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import AddCloudProviderPage from './add-cloud-provider-page'
import { cloudProviderActions } from '../infrastructure/cloudProviders/actions'
import Progress from 'core/components/progress/Progress'
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
    paddingBottom: theme.spacing(2),
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
  deploymentCard: {
    border: `1px solid ${theme.palette.grey['700']}`,
    '&:hover': {
      border: `1px solid ${theme.palette.blue['500']}`,
    },
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

const managementPlaneImagePath = '/ui/images/light-management-plane.svg'

const initialContext = {
  clusterName: 'PF9-single-node-cluster',
}

export enum OnboardingStepNames {
  WelcomeStep = 'welcomeStep',
  ConfigureYourInfrastructureStep = 'configureInfrastuctureStep',
  BuildClusterStep = 'buildClusterStep',
  InviteCoworkerStep = 'inviteCoworkerStep',
}

const onboardingStepNumbers = {
  [OnboardingStepNames.WelcomeStep]: 0,
  [OnboardingStepNames.ConfigureYourInfrastructureStep]: 1,
  [OnboardingStepNames.BuildClusterStep]: 2,
  [OnboardingStepNames.InviteCoworkerStep]: 3,
}

interface Props {
  initialStep: OnboardingStepNames
}

const OnboardingPage = ({ initialStep }: Props) => {
  const classes = useStyles()
  const { history } = useReactRouter()
  const [cloudProviders, loadingCloudProviders] = useDataLoader(cloudProviderActions.list)
  const [clusterChoice, setClusterChoice] = useState<ClusterChoice>('bareOs')
  const [clusterId, setClusterId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { updateUserDefaults } = useScopedPreferences('defaults')

  const BuildClusterStep = useMemo(() => {
    return objSwitchCaseAny({
      bareOs: CreateBareOsClusterPage,
      cloud: CreateCloudClusterPage,
      import: ImportClusterPage,
    })(clusterChoice)
  }, [clusterChoice])

  const handleFormCompletion = useCallback(() => {
    updateUserDefaults(UserPreferences.FeatureFlags, { isOnboarded: true })
    if (clusterChoice === 'import') {
      history.push(routes.cluster.imported.list.path())
    } else {
      history.push(routes.cluster.nodeHealth.path({ id: clusterId }))
    }
  }, [history, clusterId, clusterChoice])

  const handleDeploymentCardClick = (setWizardContext, handleNext, setActiveStep) => (
    type: ClusterChoice,
  ) => {
    setClusterChoice(type)
    setWizardContext({ clusterChoice: type })
    if (type === 'bareOs') {
      setActiveStep('buildClusterStep', 2) // Step num is 2 because the step count starts at 0
      return
    }

    setWizardContext({ provider: CloudProviders.Aws }) // set AWS as the default one for now
    handleNext()
  }

  const handleStepThreeBackButtonClick = (handleBack, setActiveStep) => () => {
    if (clusterChoice === 'bareOs') {
      setActiveStep('welcomeStep', 0)
      return
    }
    handleBack()
  }

  return (
    <>
      <DocumentMeta title="Onboarding" bodyClasses={['form-view']} />
      <FormWrapper title="" loading={submitting}>
        <Wizard
          context={initialContext}
          onComplete={handleFormCompletion}
          startingStep={onboardingStepNumbers[initialStep]}
          hideAllButtons
        >
          {({ wizardContext, setWizardContext, onNext, handleNext, handleBack, setActiveStep }) => {
            return (
              <>
                <WizardStep stepId="welcomeStep" label="Welcome" keepContentMounted={false}>
                  <div className={classes.welcomeContainer}>
                    <img src={managementPlaneImagePath} />
                    <FormFieldCard title="Welcome to Platform9">
                      <div className={classes.welcomeContent}>
                        <Text variant="body2" className={classes.descriptionText}>
                          To get started we are going to build your first cluster. You will be able
                          to deploy using a Virtual Machine, Physical Server or pubic cloud services
                          on AWS or Azure. If you have clusters in EKS, AKS or GKE you can select to
                          import them too.
                        </Text>
                        <div className={classes.deploymentChoices}>
                          <div className={classes.newClusterChoices}>
                            <DeploymentCard
                              className={classes.deploymentCard}
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
                              className={classes.deploymentCard}
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
                            className={classes.deploymentCard}
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
                    </FormFieldCard>
                  </div>
                </WizardStep>
                <WizardStep
                  stepId="configureInfrastuctureStep"
                  label="Configure Your Infrastructure"
                  keepContentMounted={false}
                >
                  <Progress loading={loadingCloudProviders}>
                    {!loadingCloudProviders && (
                      <AddCloudProviderPage
                        cloudProviders={cloudProviders}
                        wizardContext={wizardContext}
                        setWizardContext={setWizardContext}
                        onNext={onNext}
                        handleNext={handleNext}
                        setSubmitting={setSubmitting}
                        clusterChoice={clusterChoice}
                        handleBack={handleBack}
                      />
                    )}
                  </Progress>
                </WizardStep>
                <WizardStep
                  stepId="buildClusterStep"
                  label="Build Your Cluster"
                  keepContentMounted={false}
                >
                  <BuildClusterStep
                    onNext={onNext}
                    handleNext={handleNext}
                    wizardContext={wizardContext}
                    setWizardContext={setWizardContext}
                    setSubmitting={setSubmitting}
                    setClusterId={setClusterId}
                  />
                  <PrevButton onClick={handleStepThreeBackButtonClick(handleBack, setActiveStep)} />
                  <SubmitButton onClick={handleNext}>
                    {clusterChoice === 'import' ? '+ Import Cluster' : '+ Create Cluster'}
                  </SubmitButton>
                </WizardStep>
                <WizardStep
                  stepId="inviteCoworkerStep"
                  label="Invite a Coworker"
                  keepContentMounted={false}
                >
                  <AddCoworkerStep
                    onNext={onNext}
                    wizardContext={wizardContext}
                    setWizardContext={setWizardContext}
                    setSubmitting={setSubmitting}
                  />
                  <Button
                    color="secondary"
                    className={classes.button}
                    onClick={handleFormCompletion}
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
