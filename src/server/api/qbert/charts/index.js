import context from '../../../context'
import Chart from '../../../models/monocular/Chart'

export const getCharts = (req, res) => {
  const charts = Chart.list(context)
  return res.send({ data: charts })
}

export const getChart = (req, res) => {
  const { chartName } = req.params
  const chart = Chart.get(chartName, context)
  return res.send({ data: chart })
}

export const getChartVersions = (req, res) => {
  const { chartName } = req.params
  const chart = Chart.getVersions(chartName, context)
  return res.send({ data: chart })
}
