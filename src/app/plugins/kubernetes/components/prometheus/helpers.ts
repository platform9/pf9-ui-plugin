import { ClusterTag, Pkg } from 'api-client/appbert.model'

const monitoringTask = 'pf9-mon'
const isMonitoringPackage = (pkg: Pkg) => pkg?.name === monitoringTask

export const hasPrometheusEnabled = (cluster: ClusterTag) => {
  if (!cluster || !cluster.pkgs) return false
  const installedMonitoringTask = cluster.pkgs.find(isMonitoringPackage)

  return (installedMonitoringTask || {}).validate === true
}
