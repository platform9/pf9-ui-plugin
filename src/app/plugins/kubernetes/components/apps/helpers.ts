const placeholderIcon = '/ui/images/app-catalog/app-cat-placeholder-logo@2x.png'

export const getIcon = (icon) =>
  icon && icon.match(/.(jpg|jpeg|png|gif)/) ? icon : placeholderIcon

export const getAppVersionPicklistOptions = (versions, numOptionsToShow = 15) => {
  if (!versions) {
    return []
  }
  return versions.slice(0, numOptionsToShow).map((version) => ({ value: version, label: version }))
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

  const result = 0

  for (var i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] === undefined) {
      a[i] = '0'
    }
    if ([i] === undefined) {
      b[i] = '0'
    }

    const intA = parseInt(a[i])
    const intB = parseInt(b[i])

    if (intA > intB) {
      return 1
    } else if (intA < intB) {
      return -1
    }
  }

  return result
}
