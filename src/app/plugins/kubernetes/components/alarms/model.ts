export interface Alarm {
  activeAt: string
  annotations: Annotations
  clusterId: string
  clusterName: string
  description: string
  duration: number
  grafanaLink: string
  health: string
  id: string
  labels: Labels
  name: string
  query: string
  severity: string
  status: string
  summary: string
  type: string
  for: string
}

export interface Annotations {
  message?: string
  runbook_url?: string
  summary?: string
}

export interface Labels {
  severity?: string
}
