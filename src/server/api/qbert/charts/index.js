import context from '../../../context'
import Chart from '../../../models/monocular/Chart'

export const getCharts = (req, res) => {
  const { namespace, clusterId } = req.params
  const charts = Chart.list({ context, config: { clusterId, namespace } })
  return res.send({ data: charts })
}

export const getChart = (req, res) => {
  const { namespace, clusterId } = req.params
  const { chartName } = req.params
  const chart = Chart.findByName({ name: chartName, context, config: { clusterId, namespace } })
  return res.send({ data: chart })
}

// This needs to be implemented in the model
export const getChartVersions = (req, res) => {
  const { chartName } = req.params
  const chart = Chart.getVersions(chartName, context)
  return res.send({ data: chart })
}
