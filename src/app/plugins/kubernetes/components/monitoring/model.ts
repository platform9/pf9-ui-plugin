import { GroupRule } from 'api-client/qbert.model'

export interface IAlertRule extends GroupRule {
  clusterId: string
  id: string
}

export interface IAlertRuleSelector extends IAlertRule {
  severity: any
  summary: any
  clusterName: string
  grafanaLink: string
}
