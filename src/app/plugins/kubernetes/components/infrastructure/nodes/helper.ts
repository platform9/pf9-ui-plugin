import { partition } from 'ramda'

export const isUnauthorizedHost = (host) => !host?.roles?.includes('pf9-kube')

const isPrimaryNetwork = (primaryNetwork) => ([name, ip]) => ip === primaryNetwork

export const orderInterfaces = (
  networkInterfaces: { [key: string]: string },
  primaryNetwork: string,
) => {
  return [].concat(
    ...partition(isPrimaryNetwork(primaryNetwork), Object.entries(networkInterfaces)),
  )
}
