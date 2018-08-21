import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import { withApollo } from 'react-apollo'
import { compose } from 'core/fp'

class GraphQLAddForm extends React.Component {
  handleSubmit = value => {
    const {
      client,
      history,
      mutation,
      getQuery,
      backUrl,
      objType,
    } = this.props

    try {
      client.mutate({
        mutation,
        variables: { input: value },
        update: (proxy, { data }) => {
          const tempData = proxy.readQuery({ query: getQuery })
          const item = Object.entries(data[0][1])
          tempData[objType].push(item)
          proxy.writeQuery({ query: getQuery, data: tempData })
        }
      })
      history.push(backUrl)
    } catch (err) {
      console.error(err)
    }
  }
  render () {
    return this.props.children({ handleSubmit: this.handleSubmit })
  }
}

GraphQLAddForm.propTypes = {
  // GraphQL mutation that adds the object
  mutation: PropTypes.object.isRequired,

  // GraphQL query used to update the cache
  getQuery: PropTypes.object.isRequired,

  // name of entity in GraphQL (ex: 'flavors')
  objType: PropTypes.string.isRequired,

  // Where to go after the object is added.
  backUrl: PropTypes.string,
}
export default compose(
  withApollo,
  withRouter,
)(GraphQLAddForm)
