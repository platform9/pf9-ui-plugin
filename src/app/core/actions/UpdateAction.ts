import { Dictionary, either, equals, isNil, pickAll, pipe, reject } from 'ramda'
import Action from 'core/actions/Action'
import { emptyArr, ensureArray } from 'utils/fp'
import { allKey } from 'app/constants'
import store from 'app/store'
import { cacheActions } from 'core/caching/cacheReducers'

class UpdateAction<R extends Dictionary<any>, P extends Dictionary<any> = {}> extends Action<R, P> {
  public get name() {
    return 'update'
  }

  protected postProcess = (result: R, params: P) => {
    const { indexBy = emptyArr, cacheKey, uniqueIdentifier } = this.config
    const allIndexKeys = indexBy ? ensureArray(indexBy) : emptyArr
    const indexedParams = pipe(pickAll(allIndexKeys), reject(either(isNil, equals(allKey))))(params)
    const { dispatch } = store

    dispatch(
      cacheActions.updateItem({
        uniqueIdentifier,
        cacheKey,
        params: indexedParams,
        item: result,
      }),
    )
  }
}

export default UpdateAction
