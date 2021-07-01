import Bugsnag from '@bugsnag/js'
import { makeStyles } from '@material-ui/styles'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import useDataLoader from 'core/hooks/useDataLoader'
import Theme from 'core/themes/model'
import React, { useCallback, useEffect, useRef } from 'react'
import { trackEvent } from 'utils/tracking'
import { registerExternalClusters } from '../infrastructure/clusters/import/actions'
import ClustersChecklists from '../infrastructure/clusters/import/ClustersChecklists'
import RegionsChecklist from '../infrastructure/clusters/import/RegionsChecklist'
import { importedClusterActions } from '../infrastructure/importedClusters/actions'
import { map, keys, flatten } from 'ramda'
import { ClusterCloudPlatforms } from 'app/constants'
import { CloudProviders } from '../infrastructure/cloudProviders/model'
import { toggleRegion } from '../infrastructure/clusters/import/ImportEKSClusterPage'
import { useDispatch } from 'react-redux'
import { routes } from 'core/utils/routes'
import { sessionActions } from 'core/session/sessionReducers'

const useStyles = makeStyles((theme: Theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
  regionsAndClusters: {
    display: 'flex',
  },
  regions: {
    minWidth: 200,
  },
  clusters: {
    flexGrow: 1,
  },
}))

const cloudClusterMap = {
  [CloudProviders.Aws]: ClusterCloudPlatforms.EKS,
  [CloudProviders.Azure]: ClusterCloudPlatforms.AKS,
  [CloudProviders.Gcp]: ClusterCloudPlatforms.GKE,
}

const detailsKeyMap = {
  [CloudProviders.Aws]: 'region',
  [CloudProviders.Azure]: 'resourceGroup',
  [CloudProviders.Gcp]: 'zone',
}

const ImportClusterPage = ({ wizardContext, setWizardContext, onNext, setSubmitting }) => {
  const classes = useStyles()
  const validatorRef = useRef(null)
  const [, , reloadImportedClusters] = useDataLoader(importedClusterActions.list)
  const clusterType = cloudClusterMap[wizardContext.provider]
  const detailsKey = detailsKeyMap[wizardContext.provider]
  const dispatch = useDispatch()

  const setupValidator = (validate) => {
    validatorRef.current = { validate }
  }

  useEffect(() => {
    setWizardContext({
      regions: [],
      selectedClusters: {},
      finalSelectedClusters: [],
    })
  }, [])

  const getAllSelectedClusters = (selectedClusters) => {
    const selectedRegions = keys(selectedClusters)
    const clustersMatrix = map(
      (region) =>
        selectedClusters[region].map((cluster) => ({
          region,
          ...cluster,
        })),
      selectedRegions,
    )
    return flatten(clustersMatrix)
  }

  const handleSubmit = useCallback(async () => {
    const isValid = validatorRef.current.validate()
    if (!isValid) {
      return false
    }
    setSubmitting(true)
    const finalSelectedClusters = getAllSelectedClusters(wizardContext.selectedClusters)

    const metadata = {
      cloud_provider_id: wizardContext.cloudProviderId,
      regions: wizardContext.regions,
      clusters: finalSelectedClusters.map((cluster) => cluster.id),
    }

    Bugsnag.leaveBreadcrumb(`Attempting to import ${clusterType} clusters`, metadata)
    trackEvent(`Import ${clusterType} Clusters`, metadata)

    await registerExternalClusters({
      cloudProviderId: wizardContext.cloudProviderId,
      clusters: finalSelectedClusters,
      stack: clusterType,
      detailsKey: detailsKey,
    })

    const importedClustersListUrl = routes.cluster.imported.list.path()
    dispatch(sessionActions.updateSession({ onboardingRedirectToUrl: importedClustersListUrl }))

    setSubmitting(false)
    // do this here bc invalidateCache in the actions doesn't seem to work
    reloadImportedClusters(true)
    return true
  }, [wizardContext])

  useEffect(() => {
    onNext(handleSubmit)
  }, [handleSubmit])

  return (
    <ValidatedForm
      classes={{ root: classes.validatedFormContainer }}
      initialValues={wizardContext}
      triggerSubmit={setupValidator}
      elevated={false}
    >
      <FormFieldCard title="Select Regions & Clusters">
        <div className={classes.regionsAndClusters}>
          <RegionsChecklist
            cloudProviderId={wizardContext.cloudProviderId}
            onChange={(value) => toggleRegion(value, wizardContext, setWizardContext)}
            value={wizardContext.regions || []}
            className={classes.regions}
            clusters={wizardContext.clusterList}
          />
          <ClustersChecklists
            cloudProviderId={wizardContext.cloudProviderId}
            onChange={(value, region) =>
              setWizardContext({
                selectedClusters: { ...wizardContext.selectedClusters, [region]: value },
              })
            }
            value={wizardContext.selectedClusters || {}}
            selectedRegions={wizardContext.regions || []}
            className={classes.clusters}
            stack={clusterType}
            onClustersLoad={
              clusterType === ClusterCloudPlatforms.EKS
                ? null
                : (clusters) => setWizardContext({ clusterList: clusters })
            }
          />
        </div>
      </FormFieldCard>
    </ValidatedForm>
  )
}

export default ImportClusterPage
