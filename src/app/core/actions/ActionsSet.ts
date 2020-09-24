import Action, { ActionConfig } from 'core/actions/Action'
import { Dictionary } from 'ramda'

class ActionsSet {
  private readonly actions = new Map<string, Action<any, any>>()

  constructor(private readonly commonConfig: ActionConfig) {}

  add = <R, P extends Dictionary<any> = {}>(action: Action<R, P>) => {
    if (this.actions.has(action.name)) {
      throw new Error(`Action "${action.name}" already exists in ActionsSet`)
    }
    action.updateConfig(this.commonConfig)
    this.actions.set(action.name, action)
    return action
  }

  // TODO figure out a way to get the correct typings regardless of the key used
  get = (name: string): Action<any, any> => {
    return this.actions.get(name)
  }
}

export default ActionsSet
