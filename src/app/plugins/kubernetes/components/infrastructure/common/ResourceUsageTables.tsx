import React from 'react'
import ResourceUsageTable from './ResourceUsageTable'

interface Props {
  usage: Usage
}

interface Usage {
  compute: Statistic
  memory: Statistic
  disk: Statistic
}

interface Statistic {
  current: number
  max: number
  percent: number
}

const toMHz = (value) => value * 1024

const ResourceUsageTables = ({ usage }: Props) => (
  <>
    <ResourceUsageTable valueConverter={toMHz} units="MHz" label="CPU" stats={usage.compute} />
    <ResourceUsageTable units="GiB" label="Memory" stats={usage.memory} />
    <ResourceUsageTable units="GiB" label="Storage" stats={usage.disk} />
  </>
)

export default ResourceUsageTables
