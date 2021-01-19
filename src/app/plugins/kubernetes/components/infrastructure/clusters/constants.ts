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

export const downloadAndInstallPf9CliCommand = 'bash <(curl -sL http://pf9.io/get_cli)'
export const downloadPf9CliCommand =
  'curl -O https://raw.githubusercontent.com/platform9/express-cli/master/cli-setup.sh'
export const installPf9CliCommand = 'bash ./cli-setup.sh'
export const runPf9CliCommand = 'pf9ctl cluster prep-node'
