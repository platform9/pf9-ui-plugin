import { pathStrOr } from 'utils/fp'

export const isDecco = (features) => pathStrOr(false, 'experimental.kplane', features)
