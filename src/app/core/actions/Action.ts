import DataKeys from 'k8s/DataKeys'
import { Dictionary, isNil, mapObjIndexed, pick, pipe, reject } from 'ramda'
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

export type CallbackType<R, P, D> = (params: P, depPromises: D) => Promise<R>

class Action<P, R = any[]> {
  // public readonly callback: (params: P, depPromises: Array<Promise<any>>) => Promise<R>
  public listAllCallback: (params: P, depPromises) => Promise<R>

  constructor(
    public readonly callback: (params: P, depPromises) => Promise<R>,
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

  public run = async (params: P) => {
    const depPromises = mapObjIndexed((dep) => dep.run(params), this.dependencies)
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
    await Promise.all(depPromises)
    return result
  }

  public listAll = (callback: any) => {
    const myCallback = callback as CallbackType<R, P, infer myDependencies>

    this.listAllCallback = myCallback
  }
}

export default Action
