import { differenceWith } from 'ramda'
import { DashBoardStatusCardTypes, IStatusCardWithFilterProps } from './card-templates'

export function generateDashboardMosaicGrid(reports, order) {
  const reportEntities = getAllReportsOrdered(reports, order)
  const mosaic = Array.from(Array(8))
    .fill('.')
    // eslint-disable-next-line no-extra-boolean-cast
    .map((value, idx) => (!!reportEntities[idx] ? reportEntities[idx] : value))
  const firstHalf = mosaic.slice(0, Math.ceil(mosaic.length / 2)).join(' ')
  const secondHalf = mosaic.slice(Math.ceil(mosaic.length / 2), mosaic.length).join(' ')
  return [firstHalf, secondHalf]
}
export const getAllReportsOrdered = (reports, cardOrder) => {
  const unorderedCards = differenceWith<IStatusCardWithFilterProps, string>(
    (report, cardType) => report.entity === cardType,
    reports,
    cardOrder,
  ).map((report) => report.entity)
  return [...cardOrder, ...unorderedCards]
}

export const filterReportsWithUserRole = (reports, cardOrder, role) => {
  const mappedReports = reports.map((report) => {
    // No permissions property means no restrictions
    if (!report.permissions) {
      return report
    }
    // remove the add action when not permitted to
    return report.permissions.includes(role) ? report : { ...report, addRoute: '' }
  })
  const filteredReports = mappedReports.filter((report) => {
    if (!report.overallPermissions) {
      return report
    }
    return report.overallPermissions.includes(role)
  })
  if (cardOrder?.length > 0) {
    const allCards = getAllReportsOrdered(filteredReports, cardOrder)
    return allCards.map((cardId) => filteredReports.find((report) => report.entity === cardId))
  }
  return filteredReports
}
export const baseCards = [
  DashBoardStatusCardTypes.Cluster,
  DashBoardStatusCardTypes.Node,
  DashBoardStatusCardTypes.Cloud,
]
