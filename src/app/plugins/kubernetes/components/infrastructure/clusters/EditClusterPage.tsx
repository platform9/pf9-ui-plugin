import React, { useCallback, useMemo, useEffect } from 'react'
import useReactRouter from 'use-react-router'
import useDataLoader from 'core/hooks/useDataLoader'
import { propEq, pipe, when, always, isNil, path, map, reduce } from 'ramda'
import { emptyObj, objToKeyValueArr, objSwitchCase, emptyArr } from 'utils/fp'
import useDataUpdater from 'core/hooks/useDataUpdater'
import FormWrapper from 'core/components/FormWrapper'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { pathJoin } from 'utils/misc'
import { k8sPrefix, defaultEtcBackupPath } from 'app/constants'
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
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { Divider } from '@material-ui/core'
import Text from 'core/elements/text'
import KubernetesVersion from './form-components/kubernetes-version'
import PrivilegedContainers from './form-components/privileged'
import AllowWorkloadsOnMaster from './form-components/allow-workloads-on-master'
import NetworkStack from './form-components/network-stack'
import { CloudProviders } from '../cloudProviders/model'
import { NetworkStackTypes } from './constants'
import Theme from 'core/themes/model'
import { compareVersions } from 'k8s/util/helpers'
import { clusterAddonActions } from './clusterAddons/actions'
import {
  addonParamsApiNameMap,
  clusterAddonFieldId,
  ClusterAddonType,
  getAddonParams,
} from './clusterAddons/helpers'

const objSwitchCaseAny: any = objSwitchCase // types on forward ref .js file dont work well.

const listUrl = pathJoin(k8sPrefix, 'infrastructure')

export const EditClusterContext = React.createContext({})

const useStyles = makeStyles((theme: Theme) => ({
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
  divider: {
    margin: theme.spacing(3, 0),
  },
}))

const { appbert } = ApiClient.getInstance()

// Hide pf9-system:monitoring tag from the display
// bc that tag should be handled completely by appbert.
// If the tag exists, we do not want to remove it
// so just hide it from view.
const tagsToOmit = ['pf9-system:monitoring']

const bareOSClusterAddons = [
  { addon: 'etcdBackup' },
  { addon: 'enableMetallbLayer2' },
  { addon: 'prometheusMonitoringEnabled' },
  { addon: 'networkPluginOperator', disabled: true },
  { addon: 'kubevirtPluginOperator', disabled: true },
  { addon: 'kubernetesDashboard' },
  { addon: 'metricsServer' },
  { addon: 'coreDns' },
]

const awsClusterAddons = [
  { addon: 'etcdBackup' },
  { addon: 'prometheusMonitoringEnabled' },
  { addon: 'awsEnableCAS' },
  { addon: 'kubernetesDashboard' },
  { addon: 'metricsServer' },
  { addon: 'coreDns' },
]

const azureClusterAddons = [
  { addon: 'etcdBackup' },
  { addon: 'prometheusMonitoringEnabled' },
  { addon: 'enableCAS' },
  { addon: 'kubernetesDashboard' },
  { addon: 'metricsServer' },
  { addon: 'coreDns' },
]

const bareOsAddonManagerAddons = [
  ClusterAddonType.CoreDns,
  ClusterAddonType.KubernetesDashboard,
  ClusterAddonType.MetricsServer,
  ClusterAddonType.MetalLb,
]
const awsAddonManagerAddons = [
  ClusterAddonType.CoreDns,
  ClusterAddonType.KubernetesDashboard,
  ClusterAddonType.MetricsServer,
  ClusterAddonType.AwsAutoScaler,
]
const azureAddonManagerAddons = [
  ClusterAddonType.CoreDns,
  ClusterAddonType.KubernetesDashboard,
  ClusterAddonType.MetricsServer,
  ClusterAddonType.AzureAutoScaler,
]

const addonParamsAreUpdated = (addonType, currParams, newParams) => {
  const addonParams = getAddonParams(addonType)
  if (addonParams.length === 0) return false
  for (const param of addonParams) {
    const currValue = currParams[param]
    const newValue = newParams[addonParamsApiNameMap[param]]
    if (currValue !== newValue) return true
  }
  return false
}

const EditClusterPage = () => {
  const { match, history } = useReactRouter()
  const classes = useStyles()
  const clusterId = match.params.id
  const [clusters, loadingClusters] = useDataLoader(clusterActions.list)
  const [update, updatingCluster] = useDataUpdater(clusterActions.update)
  const { params, updateParams, getParamsUpdater } = useParams({})
  const dispatch = useDispatch()
  const cluster = useMemo(() => clusters.find(propEq('uuid', clusterId)) || {}, [
    clusters,
    clusterId,
  ])
  const isNewK8sVersion = useMemo(() => compareVersions(cluster.kubeRoleVersion, '1.20') >= 0, [
    cluster.kubeRoleVersion,
  ])

  // Cluster Addons
  const [createAddon, creatingAddon] = useDataUpdater(clusterAddonActions.create)
  const [updateAddon, updatingAddon] = useDataUpdater(clusterAddonActions.update)
  const [deleteAddon, deletingAddon] = useDataUpdater(clusterAddonActions.delete)
  const [existingClusterAddons, loadingClusterAddons] = useDataLoader(clusterAddonActions.list, {
    clusterId: cluster?.uuid,
  })

  const clusterAddOns = useMemo(
    () =>
      objSwitchCaseAny(
        {
          [CloudProviders.BareOS]: bareOSClusterAddons,
          [CloudProviders.Aws]: awsClusterAddons,
          [CloudProviders.Azure]: azureClusterAddons,
        },
        [],
      )(cluster.cloudProviderType),
    [cluster.cloudProviderType],
  )

  const clusterAddonManagerAddons = useMemo(
    () =>
      objSwitchCaseAny({
        [CloudProviders.BareOS]: bareOsAddonManagerAddons,
        [CloudProviders.Aws]: awsAddonManagerAddons,
        [CloudProviders.Azure]: azureAddonManagerAddons,
      })(cluster.cloudProviderType),
    [cluster.cloudProviderType],
  )

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
        networkStack:
          values.calicoIPv4 === 'autodetect' ? NetworkStackTypes.IPv4 : NetworkStackTypes.IPv6,
      }))(cluster),
    [cluster],
  )

  useEffect(() => {
    const { etcdBackup } = cluster
    if (!etcdBackup) {
      return
    }
    updateParams({ etcdBackup: !!etcdBackup.isEtcdBackupEnabled })
  }, [cluster])

  useEffect(() => {
    const addons = pipe(
      when(isNil, always(emptyArr)),
      map((addon: any) => {
        const fieldId = clusterAddonFieldId[addon.type]
        return fieldId ? { [fieldId]: true, ...addon.params } : {}
      }),
      reduce((acc, item) => ({ ...acc, ...item }), {}),
    )(existingClusterAddons)
    if (addons?.MetallbIpRange) {
      const range = addons.MetallbIpRange.split('-')
      addons.metallbCidr = [{ key: range[0], value: range[1] }]
    }
    updateParams(addons)
  }, [existingClusterAddons])

  const toggleMonitoring = useCallback(
    async (enabled) => {
      try {
        const pkgs: any = await appbert.getPackages()
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

  const handleSubmit = useCallback(
    async ({ tags, ...values }) => {
      // const monitoringToggled = hasPrometheusTag(cluster) !== values.prometheusMonitoringEnabled

      // let monitoringSuccessfullyToggled = false

      // if (monitoringToggled) {
      //   monitoringSuccessfullyToggled = await toggleMonitoring(values.prometheusMonitoringEnabled)
      // }

      // await update({
      //   ...values,
      //   // The cluster ID is not present in the form as a field so it won't be passed as a value to the submit function
      //   uuid: initialValues.uuid,
      //   tags: monitoringSuccessfullyToggled
      //     ? mergeRight(keyValueArrToObj(tags), {
      //         [defaultMonitoringTag.key]: values.prometheusMonitoringEnabled,
      //       })
      //     : keyValueArrToObj(tags),
      // })

      await updateClusterAddons(values)
      history.push(listUrl)
    },
    [update, initialValues, toggleMonitoring],
  )

  const updateClusterAddons = async (values) => {
    await Promise.all(
      // Loop through all the available cluster addons that are managed by
      // the addon manager
      clusterAddonManagerAddons.map((addonType: ClusterAddonType) => {
        const fieldId = clusterAddonFieldId[addonType]
        const enableAddon = values[fieldId]
        // If values[fieldId] === undefined, meaning that the addon was not an option
        // in the edit cluster form, return
        if (enableAddon === undefined) return

        const existingAddon = existingClusterAddons.find(
          (addon) => addon.clusterId === clusterId && addon.type === addonType,
        )
        const addonIsCurrentlyEnabled = !!existingAddon
        const addonName = existingAddon?.name
        if (
          addonIsCurrentlyEnabled &&
          enableAddon &&
          addonParamsAreUpdated(addonType, existingAddon.params, values)
        ) {
          console.log('update', addonType)
          return updateAddon({ clusterId, addonType, addonName, params: values })
        } else if (addonIsCurrentlyEnabled && !enableAddon) {
          console.log('delete', addonType)
          return deleteAddon({ addonName })
        } else if (!addonIsCurrentlyEnabled && enableAddon) {
          console.log('create', addonType)
          return createAddon({
            clusterId,
            addonType,
            params: values,
          })
        }
      }),
    )
  }

  console.log('params', params)

  const updatingAddons = creatingAddon || updatingAddon || deletingAddon
  const loadingSomething =
    loadingClusters || loadingClusterAddons || updatingCluster || updatingAddons

  return (
    <EditClusterContext.Provider value={{ wizardContext: params, setWizardContext: updateParams }}>
      <DocumentMeta title="Edit Cluster" bodyClasses={['form-view']} />
      <FormWrapper
        title={`Edit Cluster ${initialValues.name || ''}`}
        loading={loadingSomething}
        message={updatingCluster || updatingAddons ? 'Submitting form...' : 'Loading Cluster...'}
        backUrl={listUrl}
      >
        <ValidatedForm
          title="Basic Details"
          classes={{ root: classes.validatedFormContainer }}
          formActions={<SubmitButton>Update Cluster</SubmitButton>}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          elevated={false}
          withAddonManager
        >
          <FormFieldCard title="Cluster Name">
            <Name setWizardContext={updateParams} />
          </FormFieldCard>
          <FormFieldCard title="Cluster Settings">
            <KubernetesVersion wizardContext={params} setWizardContext={updateParams} disabled />
            {cluster?.cloudProviderType === CloudProviders.BareOS && (
              <>
                <Divider className={classes.divider} />
                <Text variant="caption1">Cluster Network Stack</Text>
                <NetworkStack wizardContext={params} setWizardContext={updateParams} disabled />
              </>
            )}
            <Divider className={classes.divider} />
            <Text variant="caption1">Application & Container Settings</Text>
            <PrivilegedContainers wizardContext={params} setWizardContext={updateParams} disabled />
            <AllowWorkloadsOnMaster setWizardContext={getParamsUpdater} disabled />
            {isNewK8sVersion && (
              <>
                <Divider className={classes.divider} />
                <Text variant="caption1">Cluster Add-Ons</Text>
                <AddonTogglers
                  wizardContext={params}
                  setWizardContext={updateParams}
                  addons={clusterAddOns}
                />
              </>
            )}
          </FormFieldCard>
          <FormFieldCard title="Advanced Configuration">
            <TagsField info="Edit tag metadata on this cluster" blacklistedTags={tagsToOmit} />
          </FormFieldCard>
        </ValidatedForm>
      </FormWrapper>
    </EditClusterContext.Provider>
  )
}

export default EditClusterPage
