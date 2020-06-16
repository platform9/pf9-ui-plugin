import { propOr, pipe, mergeRight } from 'ramda'
import { emptyObj } from 'utils/fp'

const getParamsFilter = (defaultParams = emptyObj) => {
   return (_, props = emptyObj) =>
     pipe(
        propOr(emptyObj, 'params'),
        mergeRight(defaultParams)
     )
}

export default getParamsFilter
