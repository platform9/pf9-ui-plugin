import React from 'react'
import { compose } from 'app/utils/fp'
import { withAppContext } from 'core/providers/AppProvider'
import SearchBar from 'core/components/SearchBar'
import { omit } from 'ramda'
import JsonView from 'react-json-view'

const keysToIgnore = [
  'apiClient',
  'initialized',
]

// Some of the keys have circular references and will need to be removed before
// we can JSON.stringify them.  Others aren't really useful data to view.
const removeBadKeys = omit(keysToIgnore)

const findFirstMatching = (key, obj) => {
  if (key === '') { return obj }
  if (obj[key] !== undefined) { return obj[key] }
  return obj
}

class ContextViewer extends React.PureComponent {
  state = { searchTerm: '' }
  handleSearchChange = searchTerm => this.setState({ searchTerm })

  render () {
    const { context } = this.props
    const { searchTerm } = this.state
    const cleanContext = removeBadKeys(context)
    const searchedContext = searchTerm === ''
      ? cleanContext
      : findFirstMatching(searchTerm, cleanContext)
    return (
      <div>
        <SearchBar onSearchChange={this.handleSearchChange} searchTerm={searchTerm} />
        <JsonView src={searchedContext} collapsed={1} enableClipboard={this.handleCopy} />
      </div>
    )
  }
}

export default compose(
  withAppContext,
)(ContextViewer)
