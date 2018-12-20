import express from 'express'

// Cloud Providers
import getCloudProviders from './getCloudProviders'
import postCloudProvider from './postCloudProvider'
import putCloudProvider from './putCloudProvider'
import deleteCloudProvider from './deleteCloudProvider'

// Nodes
import getNodes from './nodes/getNodes'

// Clusters
import { getClusters, postCluster, putCluster, deleteCluster } from './clusters/clusterActions'
import getClusterVersion from './clusters/getClusterVersion'

// Namespaces
import getNamespaces from './namespaces/getNamespaces'

import { getPods, postPod, deletePod } from './pods/podActions'
import { getDeployments, postDeployment } from './deployments/deploymentActions'
import { getServices, postService, deleteService } from './services/serviceActions'

import { getCharts, getChart, getChartVersions } from './charts'
/* TODO
import { getReleases, getRelease, deleteRelease } from './releases'
import { deployApplication } from './applications'
import {
  getRepositories, getRepositoriesForCluster,
  createReponsitory, createRepositoryForCluster,
  deleteReponsitory, deleteRepositoryForCluster,
} from './repositories'
*/

import { tokenValidator } from '../../middleware'

const router = express.Router()

router.get('/v2/:tenantId/cloudProviders', tokenValidator, getCloudProviders)
router.post('/v2/:tenantId/cloudProviders', tokenValidator, postCloudProvider)
router.put('/v2/:tenantId/cloudProviders/:cloudProviderId', tokenValidator, putCloudProvider)
router.delete('/v2/:tenantId/cloudProviders/:cloudProviderId', tokenValidator, deleteCloudProvider)

router.get('/v2/:tenantId/nodes', tokenValidator, getNodes)

router.get('/v2/:tenantId/clusters', tokenValidator, getClusters)
router.post('/v2/:tenantId/clusters', tokenValidator, postCluster)
router.put('/v2/:tenantId/clusters/:clusterId', tokenValidator, putCluster)
router.delete('/v2/:tenantId/clusters/:clusterId', tokenValidator, deleteCluster)
router.get('/v2/:tenantId/clusters/:clusterId/k8sapi/version', tokenValidator, getClusterVersion)

router.get('/v2/:tenantId/clusters/:clusterId/k8sapi/api/v1/namespaces', tokenValidator, getNamespaces)

router.get('/v2/:tenantId/clusters/:clusterId/k8sapi/api/v1/namespaces/:namespace/pods', tokenValidator, getPods)
router.post('/v2/:tenantId/clusters/:clusterId/k8sapi/api/v1/namespaces/:namespace/pods', tokenValidator, postPod)
router.delete('/v2/:tenantId/clusters/:clusterId/k8sapi/api/v1/namespaces/:namespace/pods/:podName', tokenValidator, deletePod)

router.get('/v2/:tenantId/clusters/:clusterId/k8sapi/api/v1/namespaces/:namespace/deployments', tokenValidator, getDeployments)
router.post('/v2/:tenantId/clusters/:clusterId/k8sapi/api/v1/namespaces/:namespace/deployments', tokenValidator, postDeployment)

router.get('/v2/:tenantId/clusters/:clusterId/k8sapi/api/v1/namespaces/:namespace/services', tokenValidator, getServices)
router.post('/v2/:tenantId/clusters/:clusterId/k8sapi/api/v1/namespaces/:namespace/services', tokenValidator, postService)
router.delete('/v2/:tenantId/clusters/:clusterId/k8sapi/api/v1/namespaces/:namespace/services/:serviceName', tokenValidator, deleteService)

// Monocular
const k8sapi = '/v2/:tenantId/clusters/:clusterId/k8sapi/api/v1'
const monocularClusterBase = `${k8sapi}/namespaces/kube-system/services/monocular-api-svc::80/proxy/v1`
router.get(`${monocularClusterBase}/charts`, tokenValidator, getCharts)
router.get(`${monocularClusterBase}/charts/:chartName`, tokenValidator, getChart)
router.get(`${monocularClusterBase}/charts/:chartName/versions`, tokenValidator, getChartVersions)

export default router
