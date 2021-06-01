import { IDataKeys } from 'k8s/datakeys.model'
import { Dictionary, isNil } from 'ramda'
import Action, { ActionConfig } from 'core/actions/Action'
import { cacheActions } from 'core/caching/cacheReducers'
import store from 'app/store'
import { ensureArray } from 'utils/fp'

class CustomAction<
  D extends keyof IDataKeys,
  P extends Dictionary<any> = {},
  R = IDataKeys[D]
> extends Action<D, P, R> {
  private readonly customName: string
  private readonly customProcessor: (result: R, params: P) => Promise<void> | void

  public get name() {
    return this.customName
  }

  constructor(
    name: string,
    public readonly callback: (params: P) => Promise<R>,
    customProcessor?: (result: R, params: P) => Promise<void> | void,
    config?: Partial<ActionConfig<D>>,
  ) {
    super(callback, config)
    this.customName = name
    this.customProcessor = customProcessor
  }

  protected postProcess = async (result: R, params: P) => {
    if (this.customProcessor) {
      await this.customProcessor(result, params)
      return
    }
    // Default behavior if no custom processor is provided
    if (!isNil(result)) {
      const { cacheKey } = this.config
      store.dispatch(
        cacheActions.replaceAll({
          cacheKey,
          items: ensureArray(result),
        }),
      )
    }
  }
}

export default CustomAction
