import { prop } from 'ramda'

export enum UserRoles {
  Admin = 'admin',
  Member = '_member_',
  // TODO figure out what other roles we have for users
}

export const isAdminRole = (session) => {
  const user = prop('userDetails', session)
  if (!user) {
    return false
  }
  return user.role === UserRoles.Admin
}

export const findClusterName = (clusters, clusterId) => {
  const cluster = clusters.find((x) => x.uuid === clusterId)
  return (cluster && cluster.name) || null
}

/**
 * Removes anything that is not a number or a dot from the version string
 * @param {string} str
 * @returns {string}
 *
 * Ex. sanitizeKubernetesVersion("1.19.6-pmk.1625") returns "1.19.6.1625"
 */
export const sanitizeVersion = (str = '') => str.replace(/[^\d.]/g, '')

/**
 * Compares two string versions
 * @param {string} baseVersion
 * @param {string} compareVersion
 *
 * @returns {number}
 *
 * If baseVersion > compareVersion, returns 1
 * If baseVersion < compareVersion, returns -1
 * If baseVersion === compareVersion, return 0
 *
 * Ex. compareVersions("1.19.6-pmk.1625", "1.20.5-pmk.1831") returns -1
 */
export const compareVersions = (baseVersion: string, compareVersion: string) => {
  if (!baseVersion || !compareVersion) {
    return null
  }
  const bVersion = sanitizeVersion(baseVersion).split('.')
  const cVersion = sanitizeVersion(compareVersion).split('.')

  for (let i = 0; i < Math.max(bVersion.length, cVersion.length); i++) {
    const baseInt = typeof bVersion[i] === 'undefined' ? 0 : parseInt(bVersion[i])
    const compareInt = typeof cVersion[i] === 'undefined' ? 0 : parseInt(cVersion[i])

    if (baseInt > compareInt) {
      return 1
    } else if (baseInt < compareInt) {
      return -1
    }
  }

  return 0
}
