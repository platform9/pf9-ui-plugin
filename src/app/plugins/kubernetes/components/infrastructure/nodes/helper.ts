export const isUnauthorizedHost = (host) => !host?.roles?.includes('pf9-kube')
