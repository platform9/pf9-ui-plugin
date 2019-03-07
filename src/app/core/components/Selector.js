import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { Menu, MenuItem, Typography } from '@material-ui/core'
import SearchBar from './SearchBar'

const styles = theme => ({
  selector: {
    position: 'relative',
    float: 'right',
  }
})

@withStyles(styles)
class Selector extends React.Component {
  state = { anchor: null }
  handleClick = event => this.setState({ anchor: event.currentTarget })

  // Clear search bar when selector is closed.
  handleClose = anchor => event => {
    const { onChoose, onSearchChange } = this.props
    onSearchChange('')
    this.setState({ [anchor]: null })
    const value = event.target.innerText.trim()
    if (value && onChoose) {
      onChoose(value)
    }
  }

  filterBySearch = list => {
    const { searchTerm } = this.props
    return list.filter(item => item.match(new RegExp(searchTerm, 'i')) !== null)
  }

  sortList = list => {
    let _list = [...list]
    return _list.sort((a, b) => (a < b ? -1 : 1))
  }

  render () {
    const { className, classes, name, list, searchTerm, onSearchChange, type } = this.props
    const { anchor } = this.state
    const selectorName = `${name}-selector`

    const sortedList = this.sortList(list)
    const filteredList = searchTerm === '' ? sortedList : this.filterBySearch(sortedList)

    return (
      <div className={`${className} ${classes.selector}`}>
        <Typography color="inherit" variant="subtitle2" onClick={this.handleClick}>{type && `${type}: `}{name} &#9662;</Typography>
        <Menu
          id={selectorName}
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={this.handleClose('anchor')}
          getContentAnchorEl={null}
          anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
        >
          { searchTerm !== undefined && <SearchBar
            onSearchChange={onSearchChange}
            searchTerm={searchTerm}
          />}
          {filteredList.map(item => (<MenuItem onClick={this.handleClose('anchor')} key={item}>{item}</MenuItem>))}
        </Menu>
      </div>
    )
  }
}

Selector.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  list: PropTypes.array.isRequired,
  classes: PropTypes.object,
  onChoose: PropTypes.func.isRequired
}

export default Selector
