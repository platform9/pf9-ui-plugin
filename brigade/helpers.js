const { events, Job } = require('brigadier')

exports.prettyPrint = obj => console.log(JSON.stringify(obj, null, 4))

exports.helpers = (e, project) => {
  // The Docker container registry (FQDN) where we want to push / pull images are saved in the 'project' context.
  const registry = project.secrets.registry

  const payload = JSON.parse(e.payload)
  const prNumber = payload.body.check_suite.pull_requests[0].number
  const { commit, ref } = e.revision

  const logEventParams = () => {
    // Webhook event received
    console.log(`Received check_suite for commit ${e.revision.commit}`)

    console.log('event info:')
    prettyPrint(e)

    console.log('project info:')
    printPrint(project)

    console.log('payload info:')
    const payload = JSON.parse(e.payload)
    printPrint(e.payload)

    console.log(`Container registry set to: ${registry}`)

    console.log(JSON.stringify({ prNumber, commit, ref }, null, 4))
  }

  const createJob = (name, image, tasks = []) => {
    const fullImage = `${registry}/${image}`
    const job = new Job(name, fullImage, tasks, true)
    job.streamLogs = true
    job.imagePullSecrets = ['regcred']
    job.imageForcePull = true
    return job
  }

  const sendCheckStatus = (stage, options = {}) => {
    // This image makes API calls to the Github Checks API.  What you want to send is
    // set in the container's ENV variables.
    // For more info, see: https://docs.brigade.sh/intro/tutorial04/#wrapping-our-job-in-github-checks
    // const checkRunImage = 'brigadecore/brigade-github-check-run:latest'

    // Local copy of above image to avoid network traffic and to speed up tests.
    const checkRunImage = `${registry}/report-check-status`

    const jobName = `${options.checkName}-${stage}`
    const job = new Job(jobName, checkRunImage)
    const env = {
      CHECK_PAYLOAD: e.payload,
      CHECK_NAME: options.checkName,
      CHECK_TITLE: options.title,
      CHECK_SUMMARY: options.summary,
    }
    const conclusionStages = ['success', 'failure']
    if (conclusionStages.includes(stage)) env.CHECK_CONCLUSION = stage
    if (options.text) env.CHECK_TEXT = options.text
    job.imageForcePull = false
    job.env = env
    job.streamLogs = false

    // Secrets to connect to the private container registry (habor) are stored in the cluster's secrets
    // For more info: https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/#create-a-secret-by-providing-credentials-on-the-command-line
    job.imagePullSecrets = ['regcred']
    return job.run()
  }

  const runTest = async (checkName, title, job) => {
    const startMessage = `${title} test starting`
    const successMessage = `${title} test succeeded`
    const failMessage = `${title} test failed`
    sendCheckStatus('start', {
      checkName,
      title: startMessage,
      summary: startMessage
    })
    try {
      const results = await job.run()
      sendCheckStatus('success', {
        checkName,
        title: successMessage,
        summary: successMessage,
        text: results.toString(),
      })
    } catch (err) {
      sendCheckStatus('failure', {
        checkName,
        title: failMessage,
        summary: failMessage,
        text: err,
      })
    }
  }

  return {
    // Read-only params
    registry,
    payload,
    prNumber,
    commit,
    ref,

    // functions
    logEventParams,
    sendCheckStatus,
    createJob,
    runTest,
  }
}
