import Action, { ActionConfig, CallbackType } from 'core/actions/Action'
import { Dictionary } from 'ramda'

class ActionsSet {
  private readonly actions = new Set<Action<any, any>>()

  constructor(private readonly commonConfig: ActionConfig) {}

  add = <R = any[], P = Dictionary<any>>(
    callback: CallbackType<R, P>,
    dependencies: Dictionary<Action<any>>,
    config: Partial<ActionConfig> = {},
  ) => {
    const action = new Action<P, R>(callback, { ...this.commonConfig, ...config }, dependencies)
    this.actions.add(action)
    return action
  }
}

export default ActionsSet
