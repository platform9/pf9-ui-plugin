import { includes } from 'ramda'

export const smallPlaceholderIcon = '/ui/images/app-catalog/app-cat-placeholder-logo.png'
export const mediumPlaceholderIcon = '/ui/images/app-catalog/app-cat-placeholder-logo@2x.png'
export const largePlaceholderIcon = '/ui/images/app-catalog/app-cat-placeholder-logo@3x.png'

export const getIcon = (icon) =>
  icon && icon.match(/.(jpg|jpeg|png|gif)/) ? icon : mediumPlaceholderIcon

export const getAppVersionPicklistOptions = (versions, numOptionsToShow = 15) => {
  if (!versions) {
    return []
  }
  return versions.slice(0, numOptionsToShow).map((version) => ({ value: version, label: version }))
}

/**
 * Returns a list of clusters that are connected to the repository
 * @param {string} currentRepository The current repository
 * @param {array } repositories Array of all repositories
 * @param {array} clusters Array of all clusters
 * @returns
 */
export const filterConnectedClusters = (currentRepository, repositories, clusters) => {
  // Find the current repository and get its list of clusterIds
  const connectedClusterIds =
    repositories.find((repo) => repo.name === currentRepository)?.clusters || []

  return clusters.filter((cluster) => includes(cluster.uuid, connectedClusterIds))
}
