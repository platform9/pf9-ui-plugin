import { AppPlugins, CustomerTiers } from 'app/constants'
import { pathStrOr } from 'utils/fp'

export const isDecco = (features) => pathStrOr(false, 'experimental.kplane', features)

export const showZendeskChatOption = (lastStack, customerTier) =>
  (lastStack === AppPlugins.Kubernetes || lastStack === AppPlugins.MyAccount) &&
  customerTier === CustomerTiers.Enterprise
