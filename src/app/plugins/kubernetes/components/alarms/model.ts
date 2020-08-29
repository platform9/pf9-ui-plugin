import { GroupRule, Result } from 'api-client/qbert.model'

export interface IAlertSelector extends IAlert {
  severity: any
  summary: any
  activeAt: unknown
  status: string
  clusterName: string
  grafanaLink: string
}

export interface IAlertOverTimeSelector extends ISeverityCount {
  timestamp: number
  time: string
}
export interface ISeverityCount {
  warning: number
  critical: number
  fatal: number
}
export interface IAlert extends GroupRule {
  clusterId: string
  id: string
}

export interface IAlertOverTime extends Result {
  clusterId: string
  id: string
}

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
