const config = require('../../config')

// "context" provides a common API to interact with external APIs.  We can
// use a simulated route or proxy it to the REST APIs of a real DU.
// The bulk of the server should have no knowledge of where the data is
// coming from.
const context =
  config.simulator
    ? require('./context/simulator').default
    : require('./context/rest').default

export default context
