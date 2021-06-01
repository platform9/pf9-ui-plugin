import { IDataKeys } from 'k8s/datakeys.model'
import { Dictionary, either, equals, isNil, pickAll, pipe, reject } from 'ramda'
import Action from 'core/actions/Action'
import { cacheActions } from 'core/caching/cacheReducers'
import store from 'app/store'
import { allKey } from 'app/constants'
import { emptyArr, ensureArray } from 'utils/fp'

class CreateAction<
  D extends keyof IDataKeys,
  P extends Dictionary<any> = {},
  R = IDataKeys[D]
> extends Action<D, P, R> {
  public get name() {
    return 'create'
  }

  protected postProcess = (result: R, params: P) => {
    const { indexBy = emptyArr, cacheKey } = this.config
    const allIndexKeys = indexBy ? ensureArray(indexBy) : emptyArr
    const indexedParams = pipe(pickAll(allIndexKeys), reject(either(isNil, equals(allKey))))(params)
    const { dispatch } = store

    dispatch(
      cacheActions.addItem({
        cacheKey,
        params: indexedParams,
        item: result,
      }),
    )
  }
}

export default CreateAction
