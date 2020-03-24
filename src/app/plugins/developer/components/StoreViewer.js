import React from 'react'
import SearchBar from 'core/components/SearchBar'
import JsonView from 'react-json-view'
import { connect } from 'react-redux'

const findFirstMatching = (key, obj) => {
  if (key === '') { return obj }
  if (obj[key] !== undefined) { return obj[key] }
  return obj
}

@connect(store => ({ store }))
/**
 * @deprecated Use redux dev tools instead of this
 */
class StoreViewer extends React.PureComponent {
  state = { searchTerm: '' }
  handleSearchChange = searchTerm => this.setState({ searchTerm })

  render () {
    const { store } = this.props
    const { searchTerm } = this.state
    const searchedContext = searchTerm === ''
      ? store
      : findFirstMatching(searchTerm, store)
    return (
      <div>
        <SearchBar onSearchChange={this.handleSearchChange} searchTerm={searchTerm} />
        <JsonView src={searchedContext} collapsed={1} enableClipboard={this.handleCopy} />
      </div>
    )
  }
}

export default StoreViewer
