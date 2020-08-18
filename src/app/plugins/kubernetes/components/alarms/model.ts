import { GroupRule, Result } from 'api-client/qbert.model'

export interface IAlert extends GroupRule {
  clusterId: string
  id: string
}

export interface IAlertOverTime extends Result {
  clusterId: string
  id: string
}
