import express from 'express'
// Cloud Providers
import {
  getCloudProviders, postCloudProvider, putCloudProvider, deleteCloudProvider,
} from './cloudProviders/cloudProviderActions'

import getCpTypes from './cloudProviders/getTypes'
import { getCpDetails, getCpRegionDetails } from './cloudProviders/getCpDetails'
// Nodes
import getNodes from './nodes/getNodes'
// Clusters
import { getClusters, postCluster, putCluster, deleteCluster } from './clusters/clusterActions'
import getClusterVersion from './clusters/getClusterVersion'
import { attachNodes, detachNodes } from './clusters/attachOperations'
import getKubeConfig from './kubeConfig/getKubeConfig'
// Namespaces
import getNamespaces from './namespaces/getNamespaces'

import { getPods, postPod, deletePod } from './pods/podActions'
import { getDeployments, postDeployment } from './deployments/deploymentActions'
import { getServices, postService, deleteService } from './services/serviceActions'
import {
  getStorageClasses, postStorageClass, deleteStorageClass,
} from './storageClasses/storageClassActions'

import { getCharts, getChart, getChartVersions } from './charts'
import { getReleases, getRelease, deleteRelease } from './releases'
import { tokenValidator } from '../../middleware'

import {
  getPrometheusInstances, patchPrometheusInstance, deletePrometheusInstance,
} from './prometheus'

import { getLoggings, postLogging, putLogging, deleteLogging } from './logging/loggingActions'

// TODO
// import { deployApplication } from './applications'
import { getRepositoriesForCluster } from './repositories/actions'

const router = express.Router()

const version = 'v3'
router.get(`/${version}/:tenantId/cloudProviders`, tokenValidator, getCloudProviders)
router.post(`/${version}/:tenantId/cloudProviders`, tokenValidator, postCloudProvider)
router.put(`/${version}/:tenantId/cloudProviders/:cloudProviderId`, tokenValidator, putCloudProvider)
router.delete(`/${version}/:tenantId/cloudProviders/:cloudProviderId`, tokenValidator, deleteCloudProvider)

router.get(`/${version}/:tenantId/cloudProviders/types`, tokenValidator, getCpTypes)
router.get(`/${version}/:tenantId/cloudProviders/:cloudProviderId`, tokenValidator, getCpDetails)
router.get(`/${version}/:tenantId/cloudProviders/:cloudProviderId/region/:regionId`, tokenValidator, getCpRegionDetails)

router.get(`/${version}/:tenantId/nodes`, tokenValidator, getNodes)

router.get(`/${version}/:tenantId/clusters`, tokenValidator, getClusters)
router.post(`/${version}/:tenantId/clusters`, tokenValidator, postCluster)
router.put(`/${version}/:tenantId/clusters/:clusterId`, tokenValidator, putCluster)
router.delete(`/${version}/:tenantId/clusters/:clusterId`, tokenValidator, deleteCluster)
router.get(`/${version}/:tenantId/clusters/:clusterId/k8sapi/version`, tokenValidator, getClusterVersion)

router.post(`/${version}/:tenantId/clusters/:clusterId/attach`, tokenValidator, attachNodes)
router.post(`/${version}/:tenantId/clusters/:clusterId/detach`, tokenValidator, detachNodes)

router.get(`/${version}/:tenantId/kubeconfig/:clusterId`, tokenValidator, getKubeConfig)

const clusterK8sApiBase = `/${version}/:tenantId/clusters/:clusterId/k8sapi`
const k8sapi = `${clusterK8sApiBase}/api/v1`
const k8sBetaApi = `${clusterK8sApiBase}/apis/extensions/v1beta1`

router.get(`${k8sapi}/namespaces`, tokenValidator, getNamespaces)

router.get(`${k8sapi}/pods`, tokenValidator, getPods)
router.get(`${k8sapi}/namespaces/:namespace/pods`, tokenValidator, getPods)
router.post(`${k8sapi}/namespaces/:namespace/pods`, tokenValidator, postPod)
router.delete(`${k8sapi}/namespaces/:namespace/pods/:podName`, tokenValidator, deletePod)

router.get(`${k8sBetaApi}/deployments`, tokenValidator, getDeployments)
router.get(`${k8sBetaApi}/namespaces/:namespace/deployments`, tokenValidator, getDeployments)
router.post(`${k8sBetaApi}/namespaces/:namespace/deployments`, tokenValidator, postDeployment)

router.get(`${k8sapi}/services`, tokenValidator, getServices)
router.get(`${k8sapi}/namespaces/:namespace/services`, tokenValidator, getServices)
router.post(`${k8sapi}/namespaces/:namespace/services`, tokenValidator, postService)
router.delete(`${k8sapi}/namespaces/:namespace/services/:serviceName`, tokenValidator, deleteService)

const storageClassApi = `/${version}/:tenantId/clusters/:clusterId/k8sapi/apis/storage.k8s.io/v1/storageclasses`

router.get(`${storageClassApi}`, tokenValidator, getStorageClasses)
router.post(`${storageClassApi}`, tokenValidator, postStorageClass)
router.delete(`${storageClassApi}/:storageClassName`, tokenValidator, deleteStorageClass)

// Monocular
const monocularClusterBase = `${k8sapi}/namespaces/kube-system/services/monocular-api-svc::80/proxy/v1`
router.get(`${monocularClusterBase}/charts`, tokenValidator, getCharts)
router.get(`${monocularClusterBase}/charts/:chartName`, tokenValidator, getChart)
router.get(`${monocularClusterBase}/charts/:chartName/versions`, tokenValidator, getChartVersions)

router.get(`${monocularClusterBase}/releases`, tokenValidator, getReleases)
router.get(`${monocularClusterBase}/releases/:releaseName`, tokenValidator, getRelease)
router.delete(`${monocularClusterBase}/releases/:releaseName`, tokenValidator, deleteRelease)

router.get(`${monocularClusterBase}/repos`, tokenValidator, getRepositoriesForCluster)

// Managed Prometheus
const monitoringBase = `${clusterK8sApiBase}/apis/monitoring.coreos.com/v1`
router.get(`${monitoringBase}/prometheuses`, tokenValidator, getPrometheusInstances)
router.patch(`${monitoringBase}/namespaces/:namespace/prometheuses/:name`, tokenValidator, patchPrometheusInstance)
router.delete(`${monitoringBase}/namespaces/:namespace/prometheuses/:name`, tokenValidator, deletePrometheusInstance)

// TODO: check Logging urls
const loggingBase = `/apis/logging.pf9.io/v1alpha1`
router.get(`/${loggingBase}/loggings`, tokenValidator, getLoggings)
router.post(`/${loggingBase}/loggings`, tokenValidator, postLogging)
router.put(`/${loggingBase}/loggings/:clusterId`, tokenValidator, putLogging)
router.delete(`/${loggingBase}/loggings/:clusterId`, tokenValidator, deleteLogging)

export default router
