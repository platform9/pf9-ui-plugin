export enum ClusterType {
  SingleNodeCluster = 'singleNodeCluster',
  MultiNodeCluster = 'multiNodeCluster',
}

export enum HardwareType {
  CPU = 'cpu',
  RAM = 'ram',
  Disk = 'disk',
}

export const nodeHardwareRequirements = {
  singleNodeCluster: {
    [HardwareType.CPU]: 4,
    [HardwareType.RAM]: 16,
    [HardwareType.Disk]: 30,
  },
  multiNodeCluster: {
    [HardwareType.CPU]: 2,
    [HardwareType.RAM]: 10,
    [HardwareType.Disk]: 30,
  },
}

export const minAvailableDiskSpace = 20
