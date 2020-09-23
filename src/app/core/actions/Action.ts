import DataKeys from 'k8s/DataKeys'
import { Dictionary, isNil, mapObjIndexed, pick, pipe, reject, ValueOfRecord } from 'ramda'
import { allKey } from 'app/constants'
import { emptyArr, ensureArray } from 'utils/fp'

export interface ActionConfig {
  uniqueIdentifier: string | string[]
  indexBy?: string | string[]
  entityName?: string
  cacheKey: DataKeys
  cache?: boolean
  successMessage?: (<D, P>(updatedItems: D[], prevItems: D[], params: P) => string) | string
  errorMessage?: (<P>(err: Error, params: P) => string) | string
}
export type ActionDependency = Record<string, Promise<any[]>>

export type CallbackType<R, P, D = ActionDependency> = (params: P, depPromises: D) => Promise<R>

class Action<P, R = any[]> {
  // public readonly callback: (params: P, depPromises: Array<Promise<any>>) => Promise<R>
  public listAllCallback: CallbackType<R, P>

  constructor(
    public readonly callback: CallbackType<R, P>,
    public readonly config: ActionConfig,
    private readonly dependencies: Dictionary<Action<any>>,
  ) {
    this.callback = callback
    this.config = {
      uniqueIdentifier: 'id',
      cache: true,
      ...config,
    }
  }

  public run = async (params: P): Promise<R> => {
    const depPromises: ActionDependency = mapObjIndexed(
      async (dep) => dep.run(params),
      this.dependencies,
    )
    // eslint-disable-next-line @typescript-eslint/require-await
    // const depPromises = this.dependencies.map((dep) => dep.run(params))
    const { indexBy } = this.config

    const allIndexKeys = indexBy ? ensureArray(indexBy) : emptyArr
    const providedRequiredParams = pipe(pick(allIndexKeys), reject(isNil))(params)
    // @ts-ignore
    const [primaryKey] = providedRequiredParams

    const whichCallback =
      primaryKey === allKey || isNil(primaryKey) ? this.listAllCallback : this.callback
    const result = await whichCallback(params, depPromises)
    await Promise.all(Object.values(depPromises))
    return result
  }

  public listAll = (callback: CallbackType<R, P>) => {
    this.listAllCallback = callback
  }
}

export default Action
