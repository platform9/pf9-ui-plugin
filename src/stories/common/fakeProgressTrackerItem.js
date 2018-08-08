import faker from 'faker'

const fakeProgressTrackerItem = () => ({
  stepId: faker.random.word(),
  label: faker.random.word(),
})

export default fakeProgressTrackerItem
