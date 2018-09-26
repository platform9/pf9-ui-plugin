import faker from 'faker'

const fakeImage = () => ({
  id: faker.random.uuid(),
  name: faker.random.word(),
  pf9_description: faker.random.words(),
  status: faker.random.arrayElement(['OK', 'Missing']),
  owner: faker.random.word(),
  visibility: faker.random.arrayElement(['private', 'public']),
  protected: faker.random.boolean().toString(),
  disk_format: 'qw2',
  virtual_size: faker.random.number(),
  size: faker.random.number(),
  created_at: faker.date.past().toString()
})

export default fakeImage
