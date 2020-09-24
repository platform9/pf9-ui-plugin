import { Dictionary } from 'ramda'
import Action, { ActionConfig } from 'core/actions/Action'
import { cacheActions } from 'core/caching/cacheReducers'
import store from 'app/store'
import { ensureArray } from 'utils/fp'

class CustomAction<R, P extends Dictionary<any> = {}> extends Action<R, P> {
  private readonly customName: string
  private readonly customProcessor: (params: P) => Promise<R> | R

  public get name() {
    return this.customName
  }

  constructor(
    name: string,
    public readonly callback: (params: P) => Promise<R>,
    customProcessor?: (params: P) => Promise<R>,
    config?: Partial<ActionConfig>,
  ) {
    super(callback, config)
    this.customName = name
    this.customProcessor = customProcessor
  }

  protected postProcess = async (result: R, params: P) => {
    if (this.customProcessor) {
      await this.customProcessor(params)
      return
    }
    const { cacheKey } = this.config
    store.dispatch(
      cacheActions.replaceAll({
        cacheKey,
        items: ensureArray(result),
      }),
    )
  }
}

export default CustomAction
