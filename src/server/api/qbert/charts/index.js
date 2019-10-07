import context from '../../../context'
import Chart from '../../../models/monocular/Chart'
import { pathEq, allPass, propEq } from 'ramda'

export const getCharts = (req, res) => {
  const { namespace, clusterId } = req.params
  const charts = Chart.list({ context, config: { clusterId, namespace } })
  return res.send(charts)
}

export const getChart = (req, res) => {
  const { chartName, namespace, clusterId } = req.params
  const chart = Chart.findByName({ name: chartName, context, config: { clusterId, namespace } })
  return res.send(chart)
}

export const getChartVersions = (req, res) => {
  const { releaseName, chartName } = req.params
  const versions = Chart.getVersions(chartName, context)
  const id = `${releaseName}/${chartName}`
  return res.send(versions.filter(
    propEq('id', id),
  ))
}

export const getChartVersion = (req, res) => {
  const { releaseName, chartName, version } = req.params
  const id = `${releaseName}/${chartName}`
  const versions = Chart.getVersions(chartName, context)
  const chartVersion = versions.find(allPass([
    propEq('id', id),
    pathEq(['attributes', 'version'], version),
  ]))
  return res.send(chartVersion)
}
