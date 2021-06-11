import { IDataKeys } from 'k8s/datakeys.model'
import { Dictionary, either, equals, isNil, pickAll, pipe, reject } from 'ramda'
import Action from 'core/actions/Action'
import { emptyArr, ensureArray } from 'utils/fp'
import { allKey } from 'app/constants'
import store from 'app/store'
import { cacheActions } from 'core/caching/cacheReducers'

class DeleteAction<
  D extends keyof IDataKeys,
  P extends Dictionary<any> = {},
  R = IDataKeys[D]
> extends Action<D, P, R> {
  public get name() {
    return 'delete'
  }

  protected postProcess = (result: R, params: P) => {
    const { indexBy = emptyArr, cacheKey, uniqueIdentifier } = this.config
    const allIndexKeys = indexBy ? ensureArray(indexBy) : emptyArr
    const indexedParams = pipe(pickAll(allIndexKeys), reject(either(isNil, equals(allKey))))(params)
    const { dispatch } = store

    dispatch(
      cacheActions.removeItem({
        uniqueIdentifier,
        cacheKey,
        params: indexedParams,
      }),
    )
  }
}

export default DeleteAction
