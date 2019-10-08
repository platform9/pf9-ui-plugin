import express from 'express'
import { readFile } from 'fs'
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

import { getCharts, getChart, getChartVersions, getChartVersion } from './charts'
import { getReleases, getRelease, deleteRelease } from './releases'
import { tokenValidator } from '../../middleware'

import {
  getPrometheusInstances, patchPrometheusInstance, deletePrometheusInstance,
} from './prometheus'

import { getLoggings, postLogging, putLogging, deleteLogging } from './logging/loggingActions'

// TODO
// import { deployApplication } from './applications'
import { getRepositoriesForCluster } from './repositories/actions'
import path from 'path'

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
const monocularClusterBase = `${k8sapi}/namespaces/kube-system/services/monocular-api-svc::80/proxy`
const monocularClusterBaseV1 = `${monocularClusterBase}/v1`
router.get(`${monocularClusterBaseV1}/charts/:releaseName/:chartName/versions/:version`, tokenValidator, getChartVersion)
router.get(`${monocularClusterBaseV1}/charts/:releaseName/:chartName/versions`, tokenValidator, getChartVersions)
router.get(`${monocularClusterBaseV1}/charts/:releaseName/:chartName/:version`, tokenValidator, getChart)
router.get(`${monocularClusterBaseV1}/charts`, tokenValidator, getCharts)
router.get(`${monocularClusterBase}/assets/:releaseName/:chartName/:version/README.md`, tokenValidator, (req,
  res) => {
  const mdPath = path.join(__dirname, '/../../assets/dummyMarkdown.md')
  readFile(mdPath, 'utf8', (err, data) => {
    res.send(data)
    if (err) {
      return null
    }
  })
})

router.get(`${monocularClusterBaseV1}/releases`, tokenValidator, getReleases)
router.get(`${monocularClusterBaseV1}/releases/:releaseName`, tokenValidator, getRelease)
router.delete(`${monocularClusterBaseV1}/releases/:releaseName`, tokenValidator, deleteRelease)

router.get(`${monocularClusterBaseV1}/repos`, tokenValidator, getRepositoriesForCluster)

// Managed Prometheus
const monitoringBase = `${clusterK8sApiBase}/apis/monitoring.coreos.com/v1`
router.get(`${monitoringBase}/prometheuses`, tokenValidator, getPrometheusInstances)
router.patch(`${monitoringBase}/namespaces/:namespace/prometheuses/:name`, tokenValidator, patchPrometheusInstance)
router.delete(`${monitoringBase}/namespaces/:namespace/prometheuses/:name`, tokenValidator, deletePrometheusInstance)

// TODO: check Logging urls
const loggingBase = `/${version}/:tenantId/apis/logging.pf9.io/v1alpha1`
router.get(`${loggingBase}/loggings`, tokenValidator, getLoggings)
router.post(`${loggingBase}/loggings`, tokenValidator, postLogging)
router.put(`${loggingBase}/loggings/:clusterId`, tokenValidator, putLogging)
router.delete(`${loggingBase}/loggings/:clusterId`, tokenValidator, deleteLogging)

export default router
