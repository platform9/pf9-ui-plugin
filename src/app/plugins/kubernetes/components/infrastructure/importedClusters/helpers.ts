import { pathEq } from 'ramda'

export const importedHasPrometheusTag = pathEq(
  ['metadata', 'labels', 'pf9-system_monitoring'],
  'true',
)
