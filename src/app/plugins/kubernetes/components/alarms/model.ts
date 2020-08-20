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
