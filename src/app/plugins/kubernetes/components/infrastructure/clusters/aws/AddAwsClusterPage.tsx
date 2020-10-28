/* eslint-disable max-len */
import React, { FC, useEffect, useState } from 'react'
import FormWrapper from 'core/components/FormWrapper'
import Wizard from 'core/components/wizard/Wizard'
import WizardMeta from 'core/components/wizard/WizardMeta'
import CloudProviderCard from 'k8s/components/common/CloudProviderCard'
import useDataUpdater from 'core/hooks/useDataUpdater'
import useReactRouter from 'use-react-router'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import { pathJoin } from 'utils/misc'
import { k8sPrefix } from 'app/constants'
import { CloudProviders } from '../../cloudProviders/model'
import { routes } from 'core/utils/routes'
import { ClusterCreateTypes } from '../model'
import { getFormTitle } from '../helpers'
import DocumentMeta from 'core/components/DocumentMeta'
import { trackEvent } from 'utils/tracking'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'

const listUrl = pathJoin(k8sPrefix, 'infrastructure')

const useStyles = makeStyles((theme: Theme) => ({
  addAwsClusterPage: {
    marginTop: theme.spacing(3),
  },
}))

const AddAwsClusterPage = () => {
  const classes = useStyles()
  const { history, match } = useReactRouter()
  const createType = match?.params?.type || ClusterCreateTypes.Custom
  const [activeView, setActiveView] = useState<{ ViewComponent: FC<any> }>(null)
  const [formTitle, setFormTitle] = useState<string>('')
  const [initialContext, setInitialContext] = useState(null)

  useEffect(() => {
    async function loadFile(name) {
      const view = await import(`./create-templates/${name}`)
      setActiveView({ ViewComponent: view.default })
      setFormTitle(view.templateTitle)
      setInitialContext(view.initialContext)
    }
    loadFile(createType)
  }, [createType])

  useEffect(() => {
    trackEvent('WZ New AWS Cluster 0 Started', {
      wizard_step: 'Start',
      wizard_state: 'Started',
      wizard_progress: '0 of 4',
      wizard_name: 'Add New AWS Cluster',
    })
  }, [])

  const onComplete = (_, { uuid }) => history.push(routes.cluster.nodeHealth.path({ id: uuid }))

  const [createAwsClusterAction, creatingAwsCluster] = useDataUpdater(
    clusterActions.create,
    onComplete,
  )
  const handleSubmit = (data) =>
    createAwsClusterAction({ ...data, clusterType: CloudProviders.Aws })

  const ViewComponent = activeView?.ViewComponent
  return (
    <FormWrapper
      title={getFormTitle(formTitle, createType)}
      backUrl={listUrl}
      loading={creatingAwsCluster}
    >
      <DocumentMeta title={formTitle} bodyClasses={['form-view']} />
      {!!initialContext && (
        <Wizard
          onComplete={handleSubmit}
          context={initialContext}
          originPath={routes.cluster.add.path({ type: CloudProviders.Aws })}
        >
          {({ wizardContext, setWizardContext, onNext }) => (
            <WizardMeta
              className={classes.addAwsClusterPage}
              fields={wizardContext}
              icon={<CloudProviderCard active type={CloudProviders.Aws} />}
            >
              {ViewComponent && (
                <ViewComponent
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                  onNext={onNext}
                />
              )}
            </WizardMeta>
          )}
        </Wizard>
      )}
    </FormWrapper>
  )
}

export default AddAwsClusterPage
