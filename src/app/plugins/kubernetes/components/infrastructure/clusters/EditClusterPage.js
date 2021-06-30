import React, { useCallback, useMemo, useEffect } from 'react'
import useReactRouter from 'use-react-router'
import useDataLoader from 'core/hooks/useDataLoader'
import { propEq, pipe, when, always, isNil, path, mergeRight } from 'ramda'
import { emptyObj, objToKeyValueArr, keyValueArrToObj } from 'utils/fp'
import useDataUpdater from 'core/hooks/useDataUpdater'
import FormWrapper from 'core/components/FormWrapper'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { pathJoin } from 'utils/misc'
import {
  k8sPrefix,
  defaultEtcBackupPath,
  onboardingMonitoringSetup,
  defaultMonitoringTag,
} from 'app/constants'
import { clusterActions } from './actions'
import SubmitButton from 'core/components/SubmitButton'
import useParams from 'core/hooks/useParams'
import Name from './form-components/name'
import TagsField from './form-components/tags'
import DocumentMeta from 'core/components/DocumentMeta'
import { AddonTogglers } from './form-components/cluster-addon-manager'
import { makeStyles } from '@material-ui/styles'
import ApiClient from 'api-client/ApiClient'
import { hasPrometheusTag } from './helpers'
import { useDispatch } from 'react-redux'
import { notificationActions, NotificationType } from 'core/notifications/notificationReducers'

const listUrl = pathJoin(k8sPrefix, 'infrastructure')

const useStyles = makeStyles((theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
}))

const { appbert } = ApiClient.getInstance()

// Hide pf9-system:monitoring tag from the display
// bc that tag should be handled completely by appbert.
// If the tag exists, we do not want to remove it
// so just hide it from view.
const tagsToOmit = ['pf9-system:monitoring']

const EditClusterPage = () => {
  const { match, history } = useReactRouter()
  const classes = useStyles()
  const clusterId = match.params.id
  const [clusters, loadingClusters] = useDataLoader(clusterActions.list)
  const onComplete = useCallback((success) => success && history.push(listUrl), [history])
  const [update, updating] = useDataUpdater(clusterActions.update, onComplete)
  const { params, updateParams, getParamsUpdater } = useParams({})
  const dispatch = useDispatch()
  const cluster = useMemo(() => clusters.find(propEq('uuid', clusterId)) || {}, [
    clusters,
    clusterId,
  ])

  const initialValues = useMemo(
    () =>
      pipe(when(isNil, always(emptyObj)), ({ tags = {}, etcdBackup = {}, ...values }) => ({
        ...values,
        tags: objToKeyValueArr(tags),
        etcdBackup: !!etcdBackup.isEtcdBackupEnabled,
        etcdStoragePath:
          path(['storageProperties, localStorage'], etcdBackup) || defaultEtcBackupPath,
        etcdBackupInterval: etcdBackup.intervalInMins || 60 * 24,
        prometheusMonitoringEnabled: hasPrometheusTag(cluster),
      }))(cluster),
    [cluster],
  )

  useEffect(() => {
    const { etcdBackup } = cluster
    if (!etcdBackup) {
      return
    }
    updateParams({ etcdBackup: !!etcdBackup.isEtcdBackupEnabled })
  }, [clusters, clusterId])

  const toggleMonitoring = useCallback(
    async (enabled) => {
      try {
        const pkgs = await appbert.getPackages()
        const monPkg = pkgs.find((pkg) => pkg.name === 'pf9-mon')

        if (!monPkg) {
          dispatch(
            notificationActions.registerNotification({
              title: 'Prometheus error',
              message: 'No monitoring package found',
              type: NotificationType.error,
            }),
          )
          return false
        }

        const monId = monPkg.ID

        await appbert.toggleAddon(cluster.uuid, monId, enabled)
        if (enabled) {
          // This code is from the PrometheusAddOnDialog
          // If monitoring is disabled, then shouldn't we set it to false
          localStorage.setItem(onboardingMonitoringSetup, 'true')
        }
      } catch (e) {
        dispatch(
          notificationActions.registerNotification({
            title: 'Prometheus error',
            message: 'Failed to update monitoring status',
            type: NotificationType.error,
          }),
        )
        return false
      }
      return true
    },
    [cluster],
  )

  // Need to add etcdBackup stuff to here
  const handleSubmit = useCallback(
    async ({ tags, ...values }) => {
      const monitoringToggled = hasPrometheusTag(cluster) !== values.prometheusMonitoringEnabled

      let monitoringSuccessfullyToggled = false

      if (monitoringToggled) {
        monitoringSuccessfullyToggled = await toggleMonitoring(values.prometheusMonitoringEnabled)
      }

      await update({
        ...values,
        // The cluster ID is not present in the form as a field so it won't be passed as a value to the submit function
        uuid: initialValues.uuid,
        tags: monitoringSuccessfullyToggled
          ? mergeRight(keyValueArrToObj(tags), {
              [defaultMonitoringTag.key]: values.prometheusMonitoringEnabled,
            })
          : keyValueArrToObj(tags),
      })
    },
    [update, initialValues, toggleMonitoring],
  )

  return (
    <>
      <DocumentMeta title="Edit Cluster" bodyClasses={['form-view']} />
      <FormWrapper
        title={`Edit Cluster ${initialValues.name || ''}`}
        loading={loadingClusters || updating}
        message={updating ? 'Submitting form...' : 'Loading Cluster...'}
        backUrl={listUrl}
      >
        <ValidatedForm
          title="Basic Details"
          classes={{ root: classes.validatedFormContainer }}
          formActions={<SubmitButton>Update Cluster</SubmitButton>}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          withAddonManager
        >
          {/* Cluster Name */}
          <Name setWizardContext={getParamsUpdater} />

          {/* Tags */}
          <TagsField info="Edit tag metadata on this cluster" blacklistedTags={tagsToOmit} />

          <AddonTogglers
            wizardContext={params}
            setWizardContext={getParamsUpdater}
            addons={['etcdBackup', 'prometheusMonitoringEnabled']}
          />
        </ValidatedForm>
      </FormWrapper>
    </>
  )
}

export default EditClusterPage
