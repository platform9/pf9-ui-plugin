import context from '../../../context'
import CloudProvider from '../../../models/qbert/CloudProvider'
import { times, uniq } from 'ramda'
import faker from 'faker'
import uuid from 'uuid'

const sshKeyMap = {}

const randomAwsRegions = (numRegions = 5) => {
  const regions = times(i => {
    return {
      // make sure these are unique since they are used as keys
      RegionName: `region-${i}`,
      Endpoint: faker.internet.url()
    }
  }, numRegions)
  return { Regions: regions }
}

const randomOpenstackRegions = (numRegions = 5) => {
  const regions = uniq(times(i => ({ RegionName: `region-${i}` }), numRegions))
  return { Regions: regions }
}

const awsAzs = [
  { RegionName: 'us-west-1', State: 'available', ZoneName: 'us-west-1' },
  { RegionName: 'us-west-2', State: 'available', ZoneName: 'us-west-2' },
  { RegionName: 'us-east-1', State: 'available', ZoneName: 'us-east-1' },
  { RegionName: 'us-east-2', State: 'available', ZoneName: 'us-east-2' },
]

const fakeAwsVpc = () => {
  const VpcId = uuid.v4()
  const vpc = {
    CidrBlock: faker.internet.ip(),
    VpcName: faker.random.word(),
    VpcId,
    Subnets: [
      ...awsAzs.map(fakeAwsVpcSubnet({ VpcId, isPublic: false })),
      ...awsAzs.map(fakeAwsVpcSubnet({ VpcId, isPublic: true })),
    ],
  }
  return vpc
}

const fakeAwsVpcSubnet = ({ VpcId, isPublic }) => az => {
  return {
    VpcId,
    SubnetId: uuid.v4(),
    CidrBlock: faker.internet.ip(),
    MapPublicIpOnLaunch: isPublic,
    State: az.State,
    AvailabilityZone: az.ZoneName,
  }
}

const fakeAwsDomain = () => ({ Name: faker.internet.domainName(), Id: uuid.v4() })

const randomAwsRegionDetails = (regionId) => {
  return {
    azs: awsAzs,
    domains: uniq(times(fakeAwsDomain, 8)),
    flavors: 't2.small t2.medium t2.large'.split(' '),
    keyPairs: uniq(times(() => ({ KeyName: faker.fake('{{name.firstName}}'), KeyFingerprint: uuid.v4() }), 5)),
    operatingSystems: ['centos', 'ubuntu'],
    vpcs: uniq(times(fakeAwsVpc, 5))
  }
}

const randomOpenstackRegionDetails = (regionId) => {
  return {
    azs: uniq(times(() => ({ zoneName: faker.random.word() }), 5)),
    flavors: times(() => ({ id: faker.random.uuid(), name: faker.random.word() }), 10),
    images: times(() => ({ id: faker.random.uuid(), name: faker.random.word(), size: faker.random.number }), 10),
    keyPairs: times(() => ({ name: faker.random.word(), fingerprint: faker.random.word(), public_key: faker.random.word() }), 5),
    networks: times(() => {
      return {
        name: faker.random.word(),
        id: faker.random.uuid(),
        subnets: times(() => {
          return {
            id: faker.random.uuid(),
            name: faker.random.word(),
            cidr: faker.internet.ip()
          }
        }, 2)
      }
    }, 5),
    securityGroups: times(() => ({ name: faker.random.word(), id: faker.random.uuid() }), 5)
  }
}

const randomAzureRegions = () => ({
  Regions: [
    { RegionName: 'test', DisplayName: 'East Asia' },
    { RegionName: 'centralus', DisplayName: 'Central US' },
    { RegionName: 'eastus', DisplayName: 'East US' },
    { RegionName: 'eastus2', DisplayName: 'East US 2' },
    { RegionName: 'westus', DisplayName: 'West US' },
    { RegionName: 'northcentralus', DisplayName: 'North Central US' },
    { RegionName: 'southcentralus', DisplayName: 'South Central US' },
  ]
})

// Abbreviated list of just the fields the UI uses.
const fakeAzureVirtualNetwork = () => ({
  name: `virtual-network-${uuid.v4()}`,
  properties: {
    subnets: [
      { name: `master-subnet-${uuid.v4()}`, properties: { addressPrefix: '10.0.1.0/24' } },
      { name: `worker-subnet-${uuid.v4()}`, properties: { addressPrefix: '10.0.2.0/24' } },
    ]
  },
  resourceGroup: `azure-resource-group-${uuid.v4()}`,
})

// Only including the values that we use in the cluster template picklist.
const azureRegionDetails= {
  skus: [
    {
      name: 'Standard_A1_v2',
      capabilities: { MaxResourceVolumeMB: '10240', OSVhdSizeMB: '1047552', vCPUs: '1', HyperVGenerations: 'V1', MemoryGB: '2', MaxDataDiskCount: '2', LowPriorityCapable: 'True', PremiumIO: 'False', vCPUsAvailable: '1', ACUs: '100', vCPUsPerCore: '1', CombinedTempDiskAndCachedIOPS: '1000', CombinedTempDiskAndCachedReadBytesPerSecond: '20971520', CombinedTempDiskAndCachedWriteBytesPerSecond: '10485760', EphemeralOSDiskSupported: 'False' },
      family: 'standardAv2Family',
      locationInfo: [{ location: 'westus', zones: ['1', '2', '3'] }]
    },
    {
      name: 'Standard_A2_v2',
      capabilities: { MaxResourceVolumeMB: '20480', OSVhdSizeMB: '1047552', vCPUs: '2', HyperVGenerations: 'V1', MemoryGB: '4', MaxDataDiskCount: '4', LowPriorityCapable: 'True', PremiumIO: 'False', vCPUsAvailable: '2', ACUs: '100', vCPUsPerCore: '1', CombinedTempDiskAndCachedIOPS: '2000', CombinedTempDiskAndCachedReadBytesPerSecond: '41943040', CombinedTempDiskAndCachedWriteBytesPerSecond: '20971520', EphemeralOSDiskSupported: 'False' },
      family: 'standardAv2Family',
      locationInfo: [{ location: 'westus', zones: ['1', '2', '3'] }]
    },
    {
      name: 'Standard_A4_v2',
      capabilities: { MaxResourceVolumeMB: '40960', OSVhdSizeMB: '1047552', vCPUs: '4', HyperVGenerations: 'V1', MemoryGB: '8', MaxDataDiskCount: '8', LowPriorityCapable: 'True', PremiumIO: 'False', vCPUsAvailable: '4', ACUs: '100', vCPUsPerCore: '1', CombinedTempDiskAndCachedIOPS: '4000', CombinedTempDiskAndCachedReadBytesPerSecond: '83886080', CombinedTempDiskAndCachedWriteBytesPerSecond: '41943040', EphemeralOSDiskSupported: 'False' },
      family: 'standardAv2Family',
      locationInfo: [{ location: 'westus', zones: ['1', '2', '3'] }]
    },
    // This one has zones removed so it is useful for testing that filtering by zones is working correctly.
    // It should only show up in the SKU options when 'Use all availability zones' is selected.
    {
      name: 'Standard_B1ls',
      capabilities: { MaxResourceVolumeMB: '1024', OSVhdSizeMB: '1047552', vCPUs: '1', HyperVGenerations: 'V1,V2', MemoryGB: '0.5', MaxDataDiskCount: '2', LowPriorityCapable: 'False', PremiumIO: 'True', EphemeralOSDiskSupported: 'False' },
      family: 'standardBSFamily',
      locationInfo: [{ location: 'westus', zones: [] }]
    }
  ],
  virtualNetworks: times(fakeAzureVirtualNetwork, 3),
}

export const getCpDetails = (req, res) => {
  const { cloudProviderId } = req.params
  const cp = CloudProvider.findById({ id: cloudProviderId, context })

  // Send some defaults found from dogfood
  if (cp.type === 'local') {
    res.status(500).send({ code: 500, message: 'Cannot get details for local cloud provider' })
  } else if (cp.type === 'aws') {
    res.status(200).send(randomAwsRegions())
  } else if (cp.type === 'openstack') {
    res.status(200).send(randomOpenstackRegions())
  } else if (cp.type === 'azure') {
    res.status(200).send(randomAzureRegions())
  }
}

export const getCpRegionDetails = (req, res) => {
  const { cloudProviderId, regionId } = req.params
  const cp = CloudProvider.findById({ id: cloudProviderId, context })

  if (cp.type === 'local') {
    res.status(500).send({ code: 500, message: 'Cannot get details for local cloud provider' })
  } else if (cp.type === 'aws') {
    const awsRegionDetails = randomAwsRegionDetails()
    if (sshKeyMap[cloudProviderId] && sshKeyMap[cloudProviderId][regionId]) {
      awsRegionDetails.keyPairs = [...awsRegionDetails.keyPairs, ...sshKeyMap[cloudProviderId][regionId]]
    }
    res.status(200).send(awsRegionDetails)
  } else if (cp.type === 'openstack') {
    res.status(200).send(randomOpenstackRegionDetails())
  } else if (cp.type === 'azure') {
    res.status(200).send(azureRegionDetails)
  }
}

export const importAwsSshKey = (req, res) => {
  const { cloudProviderId, regionId } = req.params
  const sshKey = { KeyName: req.body.name, KeyFingerprint: faker.random.word() }
  if (sshKeyMap[cloudProviderId]) {
    if (sshKeyMap[cloudProviderId][regionId]) {
      sshKeyMap[cloudProviderId][regionId] = sshKeyMap[cloudProviderId][regionId].push(sshKey)
    } else {
      sshKeyMap[cloudProviderId][regionId] = [sshKey]
    }
  } else {
    sshKeyMap[cloudProviderId] = {}
    sshKeyMap[cloudProviderId][regionId] = [sshKey]
  }
  res.status(200).send(sshKey)
}
