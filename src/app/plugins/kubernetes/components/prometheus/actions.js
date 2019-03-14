export const loadPrometheusInstances = async ({ context, setContext, reload }) => {
  if (!reload && context.prometheusInstances) { return context.prometheusInstances }

  // TODO: fetch the data from actual API
  // const prometheusInstances = await context.apiClient.qbert.getPrometheusInstances()

  // Mocking out data for now:
  const mockData = [
    {
      name: 'dev-stageprom1',
      namespace: 'development',
      serviceMonitor: { prometheus: 'staging', project: 'dev' },
      alertManager: 'database-pager',
      disk: 8,
      retention: 15,
      version: 'v2.6',
      status: 'healthy',
      age: '21 hrs',
      numInstances: 4,
    },
  ]

  const prometheusInstances = mockData

  setContext({ prometheusInstances })
  return prometheusInstances
}
