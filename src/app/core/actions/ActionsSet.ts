import { IDataKeys } from 'k8s/datakeys.model'
import Action, { ActionConfig, IAction } from 'core/actions/Action'

class ActionsSet<D extends keyof IDataKeys> {
  private readonly actions = new Map<string, IAction<D>>()

  constructor(private readonly commonConfig: ActionConfig<D>) {}

  add = <R, P, A extends Action<D, P, R>>(action: A): A => {
    if (this.actions.has(action.name)) {
      throw new Error(`Action "${action.name}" already exists in ActionsSet`)
    }
    action.updateConfig(this.commonConfig)
    this.actions.set(action.name, action)
    return action
  }

  // TODO figure out a way to get the correct typings regardless of the key used
  get = (name: string): IAction<D> => {
    return this.actions.get(name)
  }
}

export default ActionsSet
