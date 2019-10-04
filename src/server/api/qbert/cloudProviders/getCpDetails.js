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
      'RegionName': `region-${i}`,
      'Endpoint': faker.internet.url()
    }
  }, numRegions)
  return { Regions: regions }
}

const randomOpenstackRegions = (numRegions = 5) => {
  const regions = uniq(times(i => ({ 'RegionName': `region-${i}` }), numRegions))
  return { Regions: regions }
}

const awsAzs = [
  { RegionName: 'us-west-1', State: 'available', ZoneName: 'us-west-1' },
  { RegionName: 'us-west-2', State: 'available', ZoneName: 'us-west-2' },
  { RegionName: 'us-east-1', State: 'available', ZoneName: 'us-east-1' },
  { RegionName: 'us-east-2', State: 'available', ZoneName: 'us-east-2' },
]

const randomAwsRegionDetails = (regionId) => {
  return {
    azs: awsAzs,
    domains: uniq(times(() => ({ 'Name': faker.random.word(), 'Id': faker.random.word() }), 8)),
    flavors: 't2.small t2.medium t2.large'.split(' '),
    keyPairs: uniq(times(() => ({ 'KeyName': faker.fake('{{name.firstName}}'), 'KeyFingerprint': uuid.v4() }), 5)),
    operatingSystems: ['centos', 'ubuntu'],
    vpcs: uniq(times(() => ({ 'CidrBlock': faker.internet.ip(), 'VpcName': faker.random.word() }), 5))
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
