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

// export interface Annotations {
//   message?: string
//   runbook_url?: string
//   summary?: string
// }

export interface Labels {
  severity?: string
}

export interface AlertManagerAlert {
  clusterId: string
  id: string
  annotations: Annotations
  endsAt: string
  fingerprint: string
  receivers: Receiver[]
  startsAt: string
  status: Status
  updatedAt: string
  generatorURL: string
  labels: { [key: string]: string }
}

export interface Annotations {
  message?: string
  runbook_url?: string
}

export interface Receiver {
  name: string
}

export interface Status {
  inhibitedBy: any[]
  silencedBy: any[]
  state: string
}

export interface IAlertSelector extends Omit<AlertManagerAlert, 'status'> {
  name: string
  severity: string
  summary: string
  status: string
  exportedNamespace: string
  query: string
  clusterName: string
  for: string
  grafanaLink: string
}
