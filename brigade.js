const { events, Job } = require('brigadier')
const { helpers } = require('./brigade/helpers')

events.on('check_suite:requested', async (e, project) => {
  // Create helpers with their context bound to the event and project.
  const { createJob, runTest } = helpers(e, project)

  const lintJob = createJob('lint-runner', 'hello-service', ['yarn jest'])
  runTest('lint', 'Lint', lintJob)

  const unitTestsJob = createJob('unit-runner', 'hello-service', ['yarn jest'])
  runTest('unit', 'Unit', unitTestsJob)
})
