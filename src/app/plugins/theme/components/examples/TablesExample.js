import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import Panel from '../Panel'
import faker from 'faker'
import moment from 'moment'
import { formattedValue } from 'core/utils/formatters'
import { range } from 'ramda'

const nop = () => {}
export const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min)

const data = range(1, randomInt(20, 30)).map(id => ({
  id,
  uuid: faker.random.uuid(),
  name: faker.name.findName(),
  phone: faker.phone.phoneNumber(),
  email: faker.internet.email(),
  date: faker.date.past(),
  storage: faker.finance.amount(),
  description: faker.lorem.sentence(),
  active: faker.random.boolean()
}))

const loadMockData = () => data

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'phone', label: 'Phone' },
  { id: 'email', label: 'Email' },
  {
    id: 'date',
    label: 'Date',
    render: value => moment(value).format('LL'),
    sortWith: (prevDate, nextDate) =>
      moment(prevDate).isBefore(nextDate) ? 1 : -1
  },
  {
    id: 'storage',
    label: 'Storage',
    render: value => formattedValue(value),
    sortWith: (prevValue, nextValue) =>
      +prevValue > +nextValue ? 1 : -1
  },
  { id: 'description', label: 'Description', sort: false, display: false },
  { id: 'active', label: 'Active', sort: false, display: false }
]

export const options = {
  columns,
  dataKey: 'example',
  deleteFn: nop,
  editUrl: '/ui/theme/examples/edit',
  loaderFn: loadMockData,
  title: 'Tables Example',
}

const { ListPage } = createCRUDComponents(options)

const TablesExample = ({ expanded = false }) => (
  <Panel title="Tables" defaultExpanded={expanded}>
    <ListPage />
  </Panel>
)

export default TablesExample
