import { IDataKeys } from 'k8s/datakeys.model'
import { Dictionary } from 'ramda'
import { isNilOrEmpty } from 'utils/fp'

export interface ActionConfig<D extends keyof IDataKeys> {
  uniqueIdentifier: string | string[]
  indexBy?: string | string[]
  entityName?: string
  cacheKey: D
  cache?: boolean
  successMessage?:
    | (<R = IDataKeys[D], P extends Dictionary<any> = {}>(
        updatedItems: R,
        prevItems: R,
        params: P,
      ) => string)
    | string
  errorMessage?: (<P extends Dictionary<any> = {}>(err: Error, params: P) => string) | string
}

export type ValueOf<T> = T[keyof T]

export interface IAction<D extends keyof IDataKeys> {
  name: string
  config: ActionConfig<D>
  updateConfig: (config: Partial<ActionConfig<D>>) => void
}

abstract class Action<D extends keyof IDataKeys, P extends Dictionary<any>, R>
  implements IAction<D> {
  public abstract get name(): string

  private baseConfig: ActionConfig<D> = {
    cacheKey: null,
    uniqueIdentifier: 'id',
    cache: true,
  }

  constructor(
    public readonly callback: (params: P) => Promise<R>,
    config?: Partial<ActionConfig<D>>,
  ) {
    if (config) {
      this.updateConfig(config)
    }
  }

  public updateConfig = (config: Partial<ActionConfig<D>>) => {
    this.baseConfig = Object.freeze({
      ...this.baseConfig,
      ...config,
    })
  }

  public get config() {
    return this.baseConfig
  }

  public get defaultResult(): R {
    return null
  }

  public call = async (params: P): Promise<R> => {
    if (isNilOrEmpty(this.config.cacheKey)) {
      throw new Error(`'cacheKey' is missing from Action configuration`)
    }

    if (!this.validateParams(params)) {
      return this.defaultResult
    }

    const result = await this.callback(params)

    await this.postProcess(result, params)

    return result
  }

  protected validateParams = (params: P): boolean => {
    return true
  }

  protected abstract postProcess: (result: R, params: P) => Promise<void> | void
}

export default Action
