import React, { Suspense, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { memoizedDep } from 'utils/misc'

const NetworkPluginOperator = React.lazy(async () => import('./network-plugin-operator'))
const KubevirtPluginOperator = React.lazy(async () => import('./kubevirt-plugin-operator'))

const PrometheusMonitoringField = React.lazy(async () => import('./prometheus-monitoring'))
const PrometheusMonitoringAddonField = React.lazy(async () =>
  import('./prometheus-monitoring').then((module) => ({
    default: module.PrometheusMonitoringAddonField,
  })),
)

const MetalLbField = React.lazy(async () => import('./metal-lb'))
const MetalLbAddonField = React.lazy(async () =>
  import('./metal-lb').then((module) => ({
    default: module.MetalLbAddonField,
  })),
)
const MetalLbLayer2Field = React.lazy(async () =>
  import('./metal-lb').then((module) => ({
    default: module.MetalLbLayer2Field,
  })),
)
const MetalLbAddonLayer2Field = React.lazy(async () =>
  import('./metal-lb').then((module) => ({
    default: module.MetalLbAddonLayer2Field,
  })),
)

const EtcdBackupFields = React.lazy(async () => import('./etcd-backup'))
const EdcdBackupAddonFields = React.lazy(async () =>
  import('./etcd-backup').then((module) => ({ default: module.EdcdBackupAddonFields })),
)

const AutoScalingField = React.lazy(async () => import('./auto-scaling'))
const AutoScalingAddonFields = React.lazy(async () =>
  import('./auto-scaling').then((module) => ({
    default: module.AutoScalingAddonFields,
  })),
)

const addonMap = {
  networkPluginOperator: {
    toggler: NetworkPluginOperator,
    details: { component: null },
  },
  kubevirtPluginOperator: {
    toggler: KubevirtPluginOperator,
    details: { component: null },
  },
  etcdBackup: {
    toggler: EtcdBackupFields,
    details: { component: EdcdBackupAddonFields },
  },
  prometheusMonitoringEnabled: {
    toggler: PrometheusMonitoringField,
    details: { component: PrometheusMonitoringAddonField, reverse: true },
  },
  enableMetallb: {
    toggler: MetalLbField,
    details: { component: MetalLbAddonField },
  },
  enableMetallbLayer2: {
    formId: 'enableMetallb',
    toggler: MetalLbLayer2Field,
    details: { component: MetalLbAddonLayer2Field },
  },
  enableCAS: {
    toggler: AutoScalingField,
    details: { component: AutoScalingAddonFields },
  },
}

interface WizardAddonContext {
  addons: string[]
  setAddonContext: (addons: string[]) => void
}

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const AddonContext = React.createContext<WizardAddonContext>({} as WizardAddonContext)

export const AddonTogglers = ({ addons, wizardContext, setWizardContext }) => {
  const { setAddonContext } = useContext(AddonContext)

  useEffect(() => {
    setAddonContext(addons)
  }, [memoizedDep(addons)])
  return (
    <Suspense fallback="loading...">
      {addons.map((addon) => {
        const Addon = getAddonComponent(addon, 'toggler')
        return (
          Addon && (
            <Addon key={addon} wizardContext={wizardContext} setWizardContext={setWizardContext} />
          )
        )
      })}
    </Suspense>
  )
}

export const AddonDetailCards = ({ values }) => {
  const { addons } = useContext(AddonContext)

  return (
    <Suspense fallback="loading...">
      {addons.map((addon) => {
        const addonId = getAddonComponent(addon, 'formId') || addon
        const { component: Addon, reverse = false } = getAddonComponent(addon, 'details')
        if (!values[addonId]) {
          return reverse ? <Addon key={addon} values={values} /> : null
        }

        return Addon && !reverse ? <Addon key={addon} values={values} /> : null
      })}
    </Suspense>
  )
}

const getAddonComponent = (addon, target) => {
  if (!addonMap[addon]) return null
  return addonMap[addon][target] || null
}

function ClusterAddonManager({ children }) {
  const [addons, setAddons] = useState([])
  const setAddonsProvider = useCallback((addons) => setAddons(addons), [])
  const addonProvider = useMemo(() => ({ addons, setAddonContext: setAddonsProvider }), [
    addons,
    setAddonsProvider,
  ])

  return <AddonContext.Provider value={addonProvider}>{children}</AddonContext.Provider>
}

export default ClusterAddonManager
