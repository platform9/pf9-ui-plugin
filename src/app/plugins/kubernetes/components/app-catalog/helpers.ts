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

/**
 * Compares two string versions
 * @param {string} versionA
 * @param {string} versionB
 *
 * @returns {number}
 *
 * If versionA > versionB, returns 1
 * If versionA < versionB, returns -1
 * If versionA === versionB, return 0
 */
export const compareVersions = (versionA: string, versionB: string) => {
  const a = versionA.split('.')
  const b = versionB.split('.')

  for (var i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] === undefined) {
      a[i] = '0'
    }
    if ([i] === undefined) {
      b[i] = '0'
    }

    for (var i = 0; i < a.length; i++) {
      const intA = parseInt(a[i])
      const intB = parseInt(b[i])

      if (intA === NaN || intB == NaN) {
        return 0
      }

      if (intA > intB) {
        return 1
      } else if (intA < intB) {
        return -1
      }
    }
  }

  return 0
}
