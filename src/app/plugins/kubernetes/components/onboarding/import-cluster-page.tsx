import Bugsnag from '@bugsnag/js'
import { makeStyles } from '@material-ui/styles'
import Progress from 'core/components/progress/Progress'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import useDataLoader from 'core/hooks/useDataLoader'
import Theme from 'core/themes/model'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { trackEvent } from 'utils/tracking'
import { registerExternalClusters } from '../infrastructure/clusters/import/actions'
import ClustersChecklists from '../infrastructure/clusters/import/ClustersChecklists'
import { toggleRegion } from '../infrastructure/clusters/import/ImportEKSClusterPage'
import RegionsChecklist from '../infrastructure/clusters/import/RegionsChecklist'
import { importedClusterActions } from '../infrastructure/importedClusters/actions'
import { map, keys, flatten } from 'ramda'

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

const ImportClusterPage = ({ wizardContext, setWizardContext, onNext }) => {
  const classes = useStyles()
  const validatorRef = useRef(null)
  const [, , reloadImportedClusters] = useDataLoader(importedClusterActions.list)
  const [submitting, setSubmitting] = useState(false)

  const setupValidator = (validate) => {
    validatorRef.current = { validate }
  }

  useEffect(() => {
    setWizardContext({ regions: [] })
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
    setSubmitting(true)
    const isValid = validatorRef.current.validate()
    if (!isValid) {
      return false
    }

    const finalSelectedClusters = getAllSelectedClusters(wizardContext.selectedClusters)

    const metadata = {
      cloud_provider_id: wizardContext.cloudProviderId,
      regions: wizardContext.regions,
      finalSelectedClusters: finalSelectedClusters.map((cluster) => cluster.id),
    }

    console.log('metadata', metadata)

    Bugsnag.leaveBreadcrumb('Attempting to import EKS clusters', metadata)
    trackEvent('Import EKS Clusters', metadata)

    await registerExternalClusters({
      cloudProviderId: wizardContext.cloudProviderId,
      clusters: finalSelectedClusters,
    })
    setSubmitting(false)
    // do this here bc invalidateCache in the actions doesn't seem to work
    reloadImportedClusters(true)
    return true
  }, [wizardContext])

  useEffect(() => {
    onNext(handleSubmit)
  }, [handleSubmit])

  return (
    <Progress message={'Creating cluster...'} loading={submitting}>
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
            />
            <ClustersChecklists
              cloudProviderId={wizardContext.cloudProviderId}
              onChange={(value, region) =>
                setWizardContext({
                  selectedClusters: { ...wizardContext.selectedClusters, [region]: value },
                })
              }
              value={wizardContext.selectedClusters}
              selectedRegions={wizardContext.regions}
              className={classes.clusters}
            />
          </div>
        </FormFieldCard>
      </ValidatedForm>
    </Progress>
  )
}

export default ImportClusterPage
