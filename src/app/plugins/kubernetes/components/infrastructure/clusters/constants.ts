export enum NetworkStackTypes {
  IPv4 = 'ipv4',
  IPv6 = 'ipv6',
  // DualStack = 'dualstack',
}

export const getDefaultCIDRIpsForStack = (stack) =>
  ({
    [NetworkStackTypes.IPv4]: {
      containersCidr: '10.20.0.0/22',
      servicesCidr: '10.21.0.0/22',
    },
    [NetworkStackTypes.IPv6]: {
      containersCidr: 'fd00:101::/116',
      servicesCidr: 'fd00:102::/116',
    },
  }?.[stack])

export const downloadAndInstallPf9CliCommand = `bash <(curl -sL https://pmkft-assets.s3-us-west-1.amazonaws.com/pf9ctl_setup)`
export const configureCliCommand = 'pf9ctl config set'
export const runPf9CliCommand = 'pf9ctl prep-node'
