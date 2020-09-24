import DataKeys from 'k8s/DataKeys'
import { Dictionary } from 'ramda'
import { isNilOrEmpty } from 'utils/fp'

export interface ActionConfig {
  uniqueIdentifier: string | string[]
  indexBy?: string | string[]
  entityName?: string
  cacheKey: DataKeys
  cache?: boolean
  successMessage?: (<D, P>(updatedItems: D[], prevItems: D[], params: P) => string) | string
  errorMessage?: (<P>(err: Error, params: P) => string) | string
}

abstract class Action<R, P extends Dictionary<any> = {}> {
  public abstract get name(): string

  private baseConfig: ActionConfig = {
    cacheKey: null,
    uniqueIdentifier: 'id',
    cache: true,
  }

  constructor(public readonly callback: (params: P) => Promise<R>, config?: Partial<ActionConfig>) {
    if (config) {
      this.updateConfig(config)
    }
  }

  public updateConfig = (config: Partial<ActionConfig>) => {
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
